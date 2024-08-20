import { IngredientName } from './enums';

/**
 * Equals to {}
 */
export type EmptyDocument = Record<string, never>;

/**
 * HTTP status codes.
 */
export type StatusCodes = 200 | 201 | 204 | 205 | 400 | 403 | 404 | 500;

/**
 * Context string format: ClassName/MethodName
 */
export type ContextString = `${string}/${string}`;

/**
 * Ingredient type
 */
export type IngredientType = {
    name: IngredientName,
    unit: string,
    amount?: number
};

/**
 * Language type
 */
export type Language = 'en' | 'en-US' | 'pl';