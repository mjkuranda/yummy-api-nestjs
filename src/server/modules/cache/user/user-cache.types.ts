export type TokenType = 'access' | 'refresh';

export type UserTokenKey = `user:${string}:${TokenType}Token`;