import { TokenKey } from './redis.types';

export function getAccessTokenKey(login: string): TokenKey {
    return getTokenKey('accessToken', login);
}

export function getRefreshTokenKey(login: string): TokenKey {
    return getTokenKey('refreshToken', login);
}

function getTokenKey(token: 'accessToken' | 'refreshToken', login: string): TokenKey {
    return `user:${login}:${token}`;
}