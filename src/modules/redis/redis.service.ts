import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { LoggerService } from '../logger/logger.service';
import { REDIS_CLIENT, REDIS_TTL } from './redis.constants';
import { TokenKey } from './redis.types';
import { getAccessTokenKey, getRefreshTokenKey } from './redis.utils';
import { MINUTE } from '../../constants/times.constant';
import { NotFoundException } from '../../exceptions/not-found.exception';

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

    async set<Document>(documentData: Document | Document[], documentType: DocumentType, expiration: number = REDIS_TTL): Promise<void> {
        const key = this.encodeKey(documentData, documentType);
        const value = JSON.stringify(documentData);

        await this.redisClient.set(key, value);
        await this.redisClient.set(key, expiration);
    }

    async unset<Document>(documentData: Document | Document[], documentType: DocumentType): Promise<void> {
        const key = this.encodeKey(documentData, documentType);

        await this.redisClient.del(key);
    }

    async setTokens(login: string, accessToken: string, refreshToken?: string): Promise<void> {
        if (refreshToken) {
            const refreshTokenKey: TokenKey = getRefreshTokenKey(login);
            await this.redisClient.set(refreshTokenKey, refreshToken);
            await this.redisClient.expire(refreshTokenKey, 5 * MINUTE);
        }

        const accessTokenKey: TokenKey = getAccessTokenKey(login);
        await this.redisClient.set(accessTokenKey, accessToken);
        await this.redisClient.expire(accessTokenKey, MINUTE);
    }

    async unsetTokens(login: string, accessToken: string, refreshToken?: string): Promise<void> {
        const accessTokenKey: TokenKey = getAccessTokenKey(login);
        const refreshTokenKey: TokenKey = getRefreshTokenKey(login);
        const cachedAccessToken = await this.getAccessToken(login);
        const context = 'RedisService/unsetTokens';

        if (!cachedAccessToken) {
            throw new NotFoundException(context, 'Not found accessToken.');
        }

        if (accessToken !== cachedAccessToken) {
            throw new NotFoundException(context, 'AccessTokens do not matched.');
        }

        await Promise.all([
            this.redisClient.del(accessTokenKey),
            this.redisClient.del(refreshTokenKey)
        ]);
    }

    async getAccessToken(login: string): Promise<string> {
        const key: TokenKey = getAccessTokenKey(login);

        return this.redisClient.get(key);
    }

    async hasRefreshToken(login: string): Promise<boolean> {
        const key: TokenKey = getAccessTokenKey(login);

        return Boolean(this.redisClient.get(key));
    }
}