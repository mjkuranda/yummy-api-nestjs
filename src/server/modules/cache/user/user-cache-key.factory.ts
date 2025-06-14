import { TokenType, UserTokenKey } from './user-cache.types';

export class UserCacheKeyFactory {

    static createUserTokenKey(userLogin: string, tokenType: TokenType): UserTokenKey {
        return `user:${userLogin}:${tokenType}Token`;
    }

}