import {
    Injectable,
    NotFoundException,
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ReportModel } from './entities/report.model';
import { CommentModel } from '../comments/entities/comment.model';
import { UserModel } from '../users/entities/user.model';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class ReportsService {
    constructor(
        @InjectModel(ReportModel)
        private readonly reportModel: typeof ReportModel,
        @InjectModel(CommentModel)
        private readonly commentModel: typeof CommentModel,
        private readonly redisService: RedisService,
    ) { }

    async create(userId: number, commentId: string, text: string) {
        const comment = await this.commentModel.findOne({ where: { id: commentId } });
        if (!comment) throw new NotFoundException('Comment not found');

        const reportersKey = `comment:${commentId}:reporters`;

        try {
            const alreadyReported = await this.redisService.sismember(reportersKey, String(userId));
            if (alreadyReported) throw new ConflictException('You already reported this comment');
        } catch (err) {
            if (err instanceof ConflictException) throw err;
        }

        const existing = await this.reportModel.findOne({ where: { userId, commentId } });
        if (existing) throw new ConflictException('You already reported this comment');

        try {
            await this.reportModel.create({ userId, commentId, text } as any);
        } catch {
            throw new InternalServerErrorException('Failed to save report');
        }

        try {
            await this.redisService.sadd(reportersKey, String(userId));
            await this.redisService.zincrby('complaints:ranking', 1, commentId);
        } catch {
        }

        return { success: true };
    }

    async getTopReported(limit = 25) {
        let commentIds: string[] = [];
        try {
            commentIds = await this.redisService.zrevrange('complaints:ranking', 0, limit - 1);
        } catch {
            return [];
        }

        if (!commentIds.length) return [];

        const comments = await this.commentModel.findAll({
            where: { id: { [Op.in]: commentIds } },
            include: [{ model: UserModel, required: false }],
        });

        const orderMap = new Map(commentIds.map((id, index) => [id, index]));

        const result = await Promise.all(
            comments.map(async (comment) => {
                let reportCount = 0;
                try {
                    const score = await this.redisService.zscore('complaints:ranking', comment.id);
                    reportCount = parseInt(score ?? '0', 10);
                } catch { }
                return { ...comment.toJSON(), reportCount };
            }),
        );

        result.sort((a, b) => (orderMap.get(a.id)! - orderMap.get(b.id)!));

        return result;
    }

    async getCommentReports(commentId: string, limit: number, offset: number) {
        return this.reportModel.findAll({
            where: { commentId },
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
    }

    async dismissReports(commentId: string) {
        try {
            await this.reportModel.destroy({ where: { commentId } });
        } catch {
            throw new InternalServerErrorException('Failed to dismiss reports');
        }

        try {
            await this.redisService.zrem('complaints:ranking', commentId);
            const members = await this.redisService.smembers(`comment:${commentId}:reporters`);
            for (const m of members) {
                await this.redisService.srem(`comment:${commentId}:reporters`, m);
            }
            await this.redisService.del(`comment:${commentId}:reporters`);
        } catch {
        }
    }
}