export type TokenKey = `user:${string}:${'accessToken' | 'refreshToken'}`;

export type DishResultQueryKey = `query:${ApiName}:${string}`;
export type DishDetailsQueryKey = `dish-details:${string}`;

export type ApiName = 'merged' | 'localmongo' | 'spoonacular';