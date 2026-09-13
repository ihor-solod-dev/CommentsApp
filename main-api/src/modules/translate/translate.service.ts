import { Injectable, NotFoundException, BadGatewayException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';
import { CommentsService } from '../comments/comments.service';
import { firstValueFrom } from 'rxjs';

const TRANSLATION_CACHE_TTL = 86400;

@Injectable()
export class TranslateService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
        private readonly commentsService: CommentsService,
    ) { }

    async translate(commentId: string, targetLang: string): Promise<string> {
        let cached: string | null = null;
        const cacheKey = `cache:translation:${targetLang}:${commentId}`;

        try {
            cached = await this.redisService.get(cacheKey);
        } catch {
            cached = null;
        }

        if (cached) return cached;

        const comment = await this.commentsService.findOne(commentId);
        if (!comment || comment.isDeleted) throw new NotFoundException('Comment not found');

        const aiUrl = this.configService.get<string>('AI_TRANSLATOR_URL');

        let translated: string;
        try {
            const { data } = await firstValueFrom(
                this.httpService.post(`${aiUrl}/translate`, {
                    text: comment.text,
                    targetLang,
                }),
            );
            translated = data.data.translation;
        } catch {
            throw new BadGatewayException('Translation service is unavailable');
        }

        try {
            await this.redisService.set(cacheKey, translated, TRANSLATION_CACHE_TTL);
        } catch {
        }

        return translated;
    }
}