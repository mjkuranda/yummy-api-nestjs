export type TokenKey = `user:${string}:${'accessToken' | 'refreshToken'}`;

export type MealResultQueryKey = `query:${ApiName}:${string}`;
export type MealDetailsQueryKey = `meal-details:${string}`;

export type ApiName = 'merged' | 'localmongo' | 'spoonacular';