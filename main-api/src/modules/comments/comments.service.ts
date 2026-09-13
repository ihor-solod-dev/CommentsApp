import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, fn, col } from 'sequelize';
import { CommentModel } from './entities/comment.model';
import { FileModel } from '../files/entities/file.model';
import { UserModel } from '../users/entities/user.model';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentsQueryDto, SortField, SortDirection } from './dto/comments-query.dto';
import { RedisService } from '../../redis/redis.service';
import { CaptchaService } from '../captcha/captcha.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { generateUuidV7 } from '../../shared/utils/uuid-v7.util';

const PAGE_SIZE = 25;
const MAX_DEPTH = 5;
const CACHE_TTL = 120;

const sortFieldMap: Record<SortField, string> = {
    [SortField.SCORE]: 'score',
    [SortField.DATE]: 'dateTime',
};

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(CommentModel)
        private readonly commentModel: typeof CommentModel,
        @InjectModel(FileModel)
        private readonly fileModel: typeof FileModel,
        private readonly redisService: RedisService,
        private readonly captchaService: CaptchaService,
        private readonly notificationsGateway: NotificationsGateway,
    ) { }

    async findRootComments(query: CommentsQueryDto) {
        const { page, sortField, sortDirection } = query;
        const cacheKey = `comments:page:${page}:sort:${sortField}:${sortDirection}`;

        try {
            const cached = await this.redisService.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch { }

        const { rows: items, count: total } = await this.commentModel.findAndCountAll({
            where: { parentId: null, isDeleted: false },
            include: [
                { model: UserModel, required: false },
                { model: FileModel, required: false },
            ],
            order: [[sortFieldMap[sortField], sortDirection]],
            offset: (page - 1) * PAGE_SIZE,
            limit: PAGE_SIZE,
            distinct: true,
        });

        console.log("items: ", items);

        const result = {
            items: items.map(this.serializeComment),
            total,
            page,
            totalPages: Math.ceil(total / PAGE_SIZE),
        };

        try {
            await this.redisService.set(cacheKey, JSON.stringify(result), CACHE_TTL);
        } catch {
        }

        return result;
    }

    async findChildren(parentId: string, limit: number, offset: number): Promise<CommentModel[]> {
        return this.commentModel.findAll({
            where: { parentId, isDeleted: false },
            include: [
                { model: UserModel, required: false },
                { model: FileModel, required: false },
            ],
            order: [['score', 'DESC']],
            limit,
            offset,
        });
    }

    async countChildren(parentId: string): Promise<number> {
        const count = await this.commentModel.count({
            where: {
                parentId,
                isDeleted: false,
            },
        });
        return Number(count) || 0;
    }

    async create(userId: number, dto: CreateCommentDto) {
        await this.captchaService.verify(dto.captchaId, dto.captchaAnswer, userId);

        try {
            const rateLimitKey = `rate:comments:${userId}`;
            const count = await this.redisService.incr(rateLimitKey);
            if (count === 1) await this.redisService.expire(rateLimitKey, 60);
            if (count > 5) throw new BadRequestException('Too many comments per minute');
        } catch (err) {
            if (err instanceof BadRequestException) throw err;
        }

        let depth = 0;
        let parentComment: CommentModel | null = null;

        if (dto.parentId) {
            parentComment = await this.commentModel.findOne({
                where: { id: dto.parentId },
                include: [{ model: UserModel, required: false }],
            });
            if (!parentComment) throw new NotFoundException('Parent comment not found');
            if (parentComment.depth >= MAX_DEPTH) {
                throw new BadRequestException(`Maximum nesting depth of ${MAX_DEPTH} reached`);
            }
            depth = parentComment.depth + 1;
        }

        const sanitizedText = this.sanitizeText(dto.text);
        const id = generateUuidV7();

        let saved: CommentModel;
        try {
            saved = await this.commentModel.create({
                id,
                text: sanitizedText,
                depth,
                parentId: dto.parentId ?? null,
                userId,
            } as any);
        } catch {
            throw new InternalServerErrorException('Failed to save comment');
        }

        if (dto.files?.length) {
            try {
                await this.fileModel.bulkCreate(
                    dto.files.map((f) => ({
                        id: f.id,
                        filePath: f.filePath,
                        commentId: saved.id,
                    })),
                );
            } catch (err) {
                console.error('Failed to create file records', err);
            }
        }

        try {
            await this.invalidateCache();
        } catch {
        }

        if (parentComment?.userId && parentComment.userId !== userId) {
            const preview = sanitizedText.substring(0, 50);
            try {
                await this.notificationsGateway.notifyUser(parentComment.userId, {
                    type: 'reply',
                    message: `На ваш комментарий "${preview}..." ответил пользователь`,
                    commentId: saved.id,
                    parentId: dto.parentId,
                });
            } catch {
            }
        }

        try {
            return await this.commentModel.findOne({
                where: { id: saved.id },
                include: [
                    { model: UserModel, required: false },
                    { model: FileModel, required: false },
                ],
            });
        } catch {
            throw new InternalServerErrorException('Failed to retrieve created comment');
        }
    }

    async update(commentId: string, userId: number, dto: UpdateCommentDto) {
        const comment = await this.commentModel.findOne({ where: { id: commentId } });
        if (!comment) throw new NotFoundException('Comment not found');
        if (comment.userId !== userId) throw new ForbiddenException('Not your comment');

        await this.captchaService.verify(dto.captchaId, dto.captchaAnswer, userId);

        comment.text = this.sanitizeText(dto.text);

        let saved: CommentModel;
        try {
            saved = await comment.save();
        } catch {
            throw new InternalServerErrorException('Failed to update comment');
        }

        try {
            await this.invalidateCache();
        } catch {
        }

        return saved;
    }

    async softDelete(commentId: string, userId: number, role: string) {
        const comment = await this.commentModel.findOne({ where: { id: commentId } });
        if (!comment) throw new NotFoundException('Comment not found');
        if (role !== 'admin' && comment.userId !== userId) {
            throw new ForbiddenException('Not your comment');
        }

        comment.isDeleted = true;

        try {
            await comment.save();
        } catch {
            throw new InternalServerErrorException('Failed to delete comment');
        }

        try {
            await this.invalidateCache();
        } catch {
        }
    }

    async findUserComments(userId: number, query: CommentsQueryDto) {
        const { page, sortField, sortDirection } = query;

        const { rows: items, count: total } = await this.commentModel.findAndCountAll({
            where: { userId },
            include: [
                { model: UserModel, required: false },
                { model: FileModel, required: false },
            ],
            order: [[sortFieldMap[sortField], sortDirection]],
            offset: (page - 1) * PAGE_SIZE,
            limit: PAGE_SIZE,
            distinct: true,
        });

        return {
            items: items.map(this.serializeComment),
            total,
            page,
            totalPages: Math.ceil(total / PAGE_SIZE),
        };
    }

    async findOne(id: string): Promise<CommentModel | null> {
        return this.commentModel.findOne({
            where: { id },
            include: [
                { model: UserModel, required: false },
                { model: FileModel, required: false },
            ],
        });
    }

    async getUserStats(userId: number) {
        const result = await this.commentModel.findOne({
            attributes: [
                [fn('COUNT', col('id')), 'total'],
                [fn('SUM', col('score')), 'totalScore'],
            ],
            where: { userId, isDeleted: false },
            raw: true,
        }) as unknown as { total: string; totalScore: string } | null;

        return {
            totalComments: parseInt(result?.total ?? '0', 10),
            totalScore: parseInt(result?.totalScore ?? '0', 10) || 0,
        };
    }

    serializeComment(comment: CommentModel) {
        return {
            id: comment.id,
            text: comment.isDeleted ? null : comment.text,
            isDeleted: comment.isDeleted,
            score: comment.score,
            depth: comment.depth,
            parentId: comment.parentId,
            dateTime: comment.dateTime,
            user: comment.isDeleted
                ? null
                : {
                    id: comment.user?.id,
                    username: comment.user?.username,
                    avatar: comment.user?.avatar,
                },
            files: comment.isDeleted ? [] : (comment.files ?? []),
        };
    }

    private sanitizeText(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/&lt;(\/?(a|code|i|strong)[^&]*?)&gt;/g, '<$1>')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '');
    }

    private async invalidateCache() {
        const keys = await (this.redisService as any).redis?.keys('comments:page:*');
        if (keys?.length) {
            for (const key of keys) await this.redisService.del(key);
        }
    }
}