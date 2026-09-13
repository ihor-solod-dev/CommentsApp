import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService {
    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) { }

    async get(key: string): Promise<string | null> {
        return this.redis.get(key);
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
            await this.redis.setex(key, ttl, value);
        } else {
            await this.redis.set(key, value);
        }
    }

    async del(key: string): Promise<void> {
        await this.redis.del(key);
    }

    async incr(key: string): Promise<number> {
        return this.redis.incr(key);
    }

    async expire(key: string, ttl: number): Promise<void> {
        await this.redis.expire(key, ttl);
    }

    async ttl(key: string): Promise<number> {
        return this.redis.ttl(key);
    }

    async hget(key: string, field: string): Promise<string | null> {
        return this.redis.hget(key, field);
    }

    async hset(key: string, field: string, value: string): Promise<void> {
        await this.redis.hset(key, field, value);
    }

    async hdel(key: string, field: string): Promise<void> {
        await this.redis.hdel(key, field);
    }

    async hgetall(key: string): Promise<Record<string, string>> {
        return this.redis.hgetall(key);
    }

    async sadd(key: string, member: string): Promise<void> {
        await this.redis.sadd(key, member);
    }

    async sismember(key: string, member: string): Promise<boolean> {
        return (await this.redis.sismember(key, member)) === 1;
    }

    async srem(key: string, member: string): Promise<void> {
        await this.redis.srem(key, member);
    }

    async smembers(key: string): Promise<string[]> {
        return this.redis.smembers(key);
    }

    async zincrby(key: string, increment: number, member: string): Promise<void> {
        await this.redis.zincrby(key, increment, member);
    }

    async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
        return this.redis.zrevrange(key, start, stop);
    }

    async zscore(key: string, member: string): Promise<string | null> {
        return this.redis.zscore(key, member);
    }

    async zrem(key: string, member: string): Promise<void> {
        await this.redis.zrem(key, member);
    }
}