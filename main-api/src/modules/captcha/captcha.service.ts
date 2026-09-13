import {
    Injectable,
    BadRequestException,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { generateUuidV7 } from '../../shared/utils/uuid-v7.util';
import * as svgCaptcha from 'svg-captcha';

const CAPTCHA_TTL = 300;
const RATE_LIMIT_TTL = 900;
const MAX_ATTEMPTS = 10;

@Injectable()
export class CaptchaService {
    constructor(private readonly redisService: RedisService) { }

    async generate() {
        const captcha = svgCaptcha.create({
            size: 4,
            noise: 3,
            color: true,
            background: '#f0f0f0',
        });

        const id = generateUuidV7();
        const key = `captcha:${id}`;
        await this.redisService.set(key, captcha.text.toLowerCase(), CAPTCHA_TTL);

        return { id, svg: captcha.data };
    }

    async verify(captchaId: string, answer: string, userId: number): Promise<void> {
        const rateKey = `rate:captcha:${userId}`;
        const attempts = await this.redisService.incr(rateKey);
        if (attempts === 1) await this.redisService.expire(rateKey, RATE_LIMIT_TTL);

        if (attempts > MAX_ATTEMPTS) {
            throw new HttpException(
                'Too many captcha attempts. Try again in 15 minutes.',
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        const key = `captcha:${captchaId}`;
        const stored = await this.redisService.get(key);
        if (!stored) throw new BadRequestException('Captcha expired or not found');

        if (stored !== answer.toLowerCase()) {
            throw new BadRequestException('Invalid captcha answer');
        }

        await this.redisService.del(key);
    }
}