import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { LoggerService } from '../logger/logger.service';
import { REDIS_CLIENT, REDIS_TTL } from './redis.constants';

type RedisKeyType = string | `${string}:${string}`;

type DocumentType = 'ingredient' | 'ingredients' | 'meal' | 'meals' | 'user' | 'users';

@Injectable()
export class RedisService {

    constructor(
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
        private loggerService: LoggerService
    ) {}

    encodeKey(documentData, documentType: DocumentType): RedisKeyType {
        if (Array.isArray(documentData)) {
            return documentType as RedisKeyType;
        }

        return `${documentType}:${documentData._id}`;
    }

    async get<Document>(key: RedisKeyType): Promise<Document[] | Document | null> {
        const rawData = await this.redisClient.get(key);

        if (rawData) {
            return null;
        }

        const parsed = JSON.parse(rawData);

        if (Array.isArray(parsed)) {
            return parsed as unknown as Document[];
        }

        return parsed as unknown as Document;
    }

    async set<Document>(documentData: Document | Document[], documentType: DocumentType): Promise<void> {
        const key = this.encodeKey(documentData, documentType);
        const value = JSON.stringify(documentData);

        await this.redisClient.set(key, value);
        await this.redisClient.expire(key, REDIS_TTL);
    }
}