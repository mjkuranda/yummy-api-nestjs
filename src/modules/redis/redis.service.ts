import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT, REDIS_TTL } from './redis.constants';
import { ApiName, DishDetailsQueryKey, DishResultQueryKey, TokenKey } from './redis.types';
import { getAccessTokenKey, getDishDetailsQueryKey, getDishResultQueryKey, getRefreshTokenKey } from './redis.utils';
import { HOUR } from '../../constants/times.constant';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { DetailedDish, RatedDish } from '../dish/dish.types';
import { ACCESS_TOKEN_DURATION, REFRESH_TOKEN_DURATION } from '../../constants/tokens.constant';

type RedisKeyType = string | `${string}:${string}`;

type DocumentType = 'ingredient' | 'ingredients' | 'dish' | 'dishes' | 'dish-details' | 'user' | 'users';

@Injectable()
export class RedisService {

    constructor(
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis
    ) {}

    encodeKey(documentData, documentType: DocumentType): RedisKeyType {
        if (Array.isArray(documentData)) {
            return documentType as RedisKeyType;
        }

        return `${documentType}:${documentData._id}`;
    }

    async hasDish(dishId: string): Promise<boolean> {
        const dish = await this.redisClient.get(`dish:${dishId}`);
        const details = await this.redisClient.get(`dish-details:${dishId}`);

        return Boolean(dish !== null || details !== null);
    }

    async deleteDish(dishId: string): Promise<void> {
        await this.redisClient.del(`dish:${dishId}`);
        await this.redisClient.del(`dish-details:${dishId}`);
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    async saveDishResult(apiName: ApiName, query: string, dishes: RatedDish[], secondsToExpire: number = 24 * HOUR): Promise<void> {
        const key: DishResultQueryKey = getDishResultQueryKey(apiName, query);
        const value = JSON.stringify(dishes);

        await this.redisClient.set(key, value);
        await this.redisClient.expire(key, secondsToExpire);
    }

    async getDishResult(apiName: ApiName, query: string): Promise<RatedDish[] | null> {
        const key: DishResultQueryKey = getDishResultQueryKey(apiName, query);
        const value = await this.redisClient.get(key);

        if (!value) {
            return null;
        }

        return JSON.parse(value);
    }

    async saveDishDetails(id: string, dishDetails: DetailedDish): Promise<void> {
        const key: DishDetailsQueryKey = getDishDetailsQueryKey(id);
        const value = JSON.stringify(dishDetails);

        await this.redisClient.set(key, value);
        await this.redisClient.expire(key, 24 * HOUR);
    }

    async getDishDetails(id: string): Promise<DetailedDish> {
        const key: DishDetailsQueryKey = getDishDetailsQueryKey(id);
        const value = await this.redisClient.get(key);

        if (!value) {
            return null;
        }

        return JSON.parse(value);
    }
}