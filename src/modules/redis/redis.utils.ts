import { ApiName, DishDetailsQueryKey, DishRecipeQueryKey, DishResultQueryKey, TokenKey } from './redis.types';
import { Language } from '../../common/types';

export function getAccessTokenKey(login: string): TokenKey {
    return getTokenKey('accessToken', login);
}

export function getRefreshTokenKey(login: string): TokenKey {
    return getTokenKey('refreshToken', login);
}

function getTokenKey(token: 'accessToken' | 'refreshToken', login: string): TokenKey {
    return `user:${login}:${token}`;
}

export function getDishResultQueryKey(apiName: ApiName, query: string): DishResultQueryKey {
    return `query:${apiName}:${query}`;
}

export function getDishDetailsQueryKey(id: string): DishDetailsQueryKey {
    return `dish-details:${id}`;
}

export function getDishRecipeQueryKey(dishId: string, language?: Language): DishRecipeQueryKey {
    return `dish:${dishId}:recipe:${language ?? 'en'}`;
}