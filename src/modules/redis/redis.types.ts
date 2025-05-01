import { Language } from '../../common/types';

export type TokenKey = `user:${string}:${'accessToken' | 'refreshToken'}`;

export type DishResultQueryKey = `query:${ApiName}:${string}`;
export type DishDetailsQueryKey = `dish-details:${string}`;
export type DishRecipeQueryKey = `dish:${string}:recipe:${Language}`;

export type ApiName = 'merged' | 'localmongo' | 'spoonacular';