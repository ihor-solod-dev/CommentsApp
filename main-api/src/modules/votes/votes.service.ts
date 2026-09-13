import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { VoteModel, VoteType } from './entities/vote.model';
import { CommentModel } from '../comments/entities/comment.model';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class VotesService {
    constructor(
        @InjectModel(VoteModel)
        private readonly voteModel: typeof VoteModel,
        @InjectModel(CommentModel)
        private readonly commentModel: typeof CommentModel,
        private readonly redisService: RedisService,
    ) { }

    async vote(userId: number, commentId: string, voteType: VoteType) {
        const comment = await this.commentModel.findOne({ where: { id: commentId } });
        if (!comment) throw new NotFoundException('Comment not found');
        if (comment.isDeleted) throw new BadRequestException('Cannot vote on deleted comment');

        const hashKey = `user:${userId}:votes`;

        let existing: string | null = null;
        try {
            existing = await this.redisService.hget(hashKey, commentId);
        } catch {
            existing = null;
        }

        if (existing === null) {
            const dbVote = await this.voteModel.findOne({
                where: { userId, commentId },
            });
            if (dbVote) {
                existing = dbVote.voteType;
                try {
                    await this.redisService.hset(hashKey, commentId, existing);
                } catch { }
            }
        }

        if (existing === voteType) {
            await this.removeVote(userId, commentId, voteType, hashKey);
        } else if (existing) {
            await this.changeVote(userId, commentId, voteType, hashKey, existing as VoteType);
        } else {
            await this.addVote(userId, commentId, voteType, hashKey);
        }

        const updated = await this.commentModel.findOne({ where: { id: commentId } });

        await this.invalidateCommentsCache();

        return {
            action: existing === voteType ? 'removed' : 'voted',
            voteType: existing === voteType ? null : voteType,
            score: updated?.score ?? 0,
        };
    }

    private async invalidateCommentsCache() {
        try {
            const keys = await (this.redisService as any).redis?.keys('comments:page:*');
            if (keys?.length) {
                for (const key of keys) {
                    await this.redisService.del(key);
                }
            }
        } catch { }
    }
    private async addVote(userId: number, commentId: string, voteType: VoteType, hashKey: string) {
        const delta = voteType === VoteType.LIKE ? 1 : -1;

        try {
            await this.voteModel.create({ userId, commentId, voteType } as any);
            await this.commentModel.increment('score', { by: delta, where: { id: commentId } });
        } catch {
            throw new InternalServerErrorException('Failed to register vote');
        }

        try {
            await this.redisService.hset(hashKey, commentId, voteType);
        } catch {
        }
    }

    private async removeVote(userId: number, commentId: string, voteType: VoteType, hashKey: string) {
        const delta = voteType === VoteType.LIKE ? -1 : 1;

        try {
            await this.voteModel.destroy({ where: { userId, commentId } });
            await this.commentModel.increment('score', { by: delta, where: { id: commentId } });
        } catch {
            throw new InternalServerErrorException('Failed to remove vote');
        }

        try {
            await this.redisService.hdel(hashKey, commentId);
        } catch {
        }
    }

    private async changeVote(
        userId: number,
        commentId: string,
        newType: VoteType,
        hashKey: string,
        oldType: VoteType,
    ) {
        const delta = newType === VoteType.LIKE ? 2 : -2;

        try {
            await this.voteModel.update({ voteType: newType }, { where: { userId, commentId } });
            await this.commentModel.increment('score', { by: delta, where: { id: commentId } });
        } catch {
            throw new InternalServerErrorException('Failed to change vote');
        }

        try {
            await this.redisService.hset(hashKey, commentId, newType);
        } catch {
        }
    }

    async getUserVotes(userId: number): Promise<Record<string, string>> {
        const hashKey = `user:${userId}:votes`;

        try {
            return await this.redisService.hgetall(hashKey);
        } catch {
            return {};
        }
    }
}