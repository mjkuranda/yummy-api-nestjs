import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { LoggerService } from '../logger/logger.service';
import { REDIS_CLIENT, REDIS_TTL } from './redis.constants';
import { ApiName, MealDetailsQueryKey, MealResultQueryKey, TokenKey } from './redis.types';
import { getAccessTokenKey, getMealDetailsQueryKey, getMealResultQueryKey, getRefreshTokenKey } from './redis.utils';
import { HOUR } from '../../constants/times.constant';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { DetailedMeal, RatedMeal } from '../meal/meal.types';
import { ACCESS_TOKEN_DURATION, REFRESH_TOKEN_DURATION } from '../../constants/tokens.constant';

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
            await this.redisClient.expire(refreshTokenKey, REFRESH_TOKEN_DURATION);
        }

        const accessTokenKey: TokenKey = getAccessTokenKey(login);
        await this.redisClient.set(accessTokenKey, accessToken);
        await this.redisClient.expire(accessTokenKey, ACCESS_TOKEN_DURATION);
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

    async getRefreshToken(login: string): Promise<string> {
        const key: TokenKey = getRefreshTokenKey(login);

        return this.redisClient.get(key);
    }

    async saveMealResult(apiName: ApiName, query: string, meals: RatedMeal[], secondsToExpire: number = 24 * HOUR): Promise<void> {
        const key: MealResultQueryKey = getMealResultQueryKey(apiName, query);
        const value = JSON.stringify(meals);

        await this.redisClient.set(key, value);
        await this.redisClient.expire(key, secondsToExpire);
    }

    async getMealResult(apiName: ApiName, query: string): Promise<RatedMeal[] | null> {
        const key: MealResultQueryKey = getMealResultQueryKey(apiName, query);
        const value = await this.redisClient.get(key);

        if (!value) {
            return null;
        }

        return JSON.parse(value);
    }

    async saveMealDetails(id: string, mealDetails: DetailedMeal): Promise<void> {
        const key: MealDetailsQueryKey = getMealDetailsQueryKey(id);
        const value = JSON.stringify(mealDetails);

        await this.redisClient.set(key, value);
        await this.redisClient.expire(key, 24 * HOUR);
    }

    async getMealDetails(id: string): Promise<DetailedMeal> {
        const key: MealDetailsQueryKey = getMealDetailsQueryKey(id);
        const value = await this.redisClient.get(key);

        if (!value) {
            return null;
        }

        return JSON.parse(value);
    }
}