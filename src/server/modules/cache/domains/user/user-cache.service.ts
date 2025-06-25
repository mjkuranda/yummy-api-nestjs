import { Inject, Injectable } from '@nestjs/common';
import { CACHE_PROVIDER } from '../../cache.constant';
import { MINUTE } from '../../../../constants/times.constant';
import { UserCacheKeyFactory } from './user-cache-key.factory';
import { TokenType, UserTokenKey } from './user-cache.types';
import { CacheClient } from '../../interfaces';

@Injectable()
export class UserCacheService {

    constructor(
        @Inject(CACHE_PROVIDER) private readonly cacheClient: CacheClient
    ) {}

    /**
     * @description Returns cached user token
     * @param userLogin user login
     * @param tokenType token type (access or refresh)
     */
    async getUserToken(userLogin: string, tokenType: TokenType): Promise<string | null> {
        const key: UserTokenKey = UserCacheKeyFactory.createUserTokenKey(userLogin, tokenType);
        const value = await this.cacheClient.get(key);

        if (!value) {
            return null;
        }

        return value;
    }

    /**
     * @description Caches user token
     * @param userLogin user login
     * @param tokenType token type (access or refresh)
     * @param token token value
     */
    async setUserToken(userLogin: string, tokenType: TokenType, token: string): Promise<void> {
        const key: UserTokenKey = UserCacheKeyFactory.createUserTokenKey(userLogin, tokenType);
        const value = JSON.stringify(token);

        const ttl = tokenType === 'access'
            ? 15 * MINUTE
            : 60 * MINUTE;

        await this.cacheClient.set(key, value);
        await this.cacheClient.expire(key, ttl);
    }

    /**
     * @description Delete from cache the both user tokens
     * @param userLogin user login
     */
    async unsetUserTokens(userLogin: string): Promise<void> {
        const key0: UserTokenKey = UserCacheKeyFactory.createUserTokenKey(userLogin, 'access');
        const key1: UserTokenKey = UserCacheKeyFactory.createUserTokenKey(userLogin, 'access');

        await this.cacheClient.del(key0, key1);
    }

}
