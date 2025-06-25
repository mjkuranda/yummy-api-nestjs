import { CacheClient } from '../../../server/modules/cache/interfaces/cache-client.interface';
import { Redis } from 'ioredis';
import { RedisOptions } from './types';
import { CachePipeline } from '../../../server/modules/cache/interfaces/cache-pipeline.interface';

export class RedisClient implements CacheClient {

    private client: Redis = null;

    constructor(options: RedisOptions) {
        this.client = new Redis(options);
    }

    getClient(): Redis {
        return this.client;
    }

    async connect(): Promise<void> {
        try {
            await this.client.connect();
        } catch (err) {
            this.client = null;

            throw new Error(`Failed to connect to Redis. ${err.message}.`);
        }
    }

    async disconnect(): Promise<void> {
        if (!this.client) {
            return;
        }

        try {
            await this.client.quit();
            this.client = null;
        } catch (err) {
            throw err;
        }
    }

    async set(key: string, val: string): Promise<void> {
        await this.client.set(key, val);
    }

    async expire(key: string, seconds: number): Promise<void> {
        await this.client.expire(key, seconds);
    }

    createPipeline(): CachePipeline {
        const pipeline = this.client.pipeline();

        return pipeline as unknown as CachePipeline;
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async hget(key: string, field: string): Promise<string | null> {
        return this.client.hget(key, field);
    }

    async hset(key: string, field: string, val: string): Promise<void> {
        await this.client.hset(key, field, val);
    }

    async del(...keys: string[]): Promise<void> {
        await this.client.del(keys);
    }

    async has(key: string): Promise<boolean> {
        const val = await this.client.get(key);

        return Boolean(val);
    }
}