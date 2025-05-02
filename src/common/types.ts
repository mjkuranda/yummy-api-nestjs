import { IngredientName } from './enums';
import { supportedLanguages } from '../constants/language.constant';

/**
 * @description Equals to {}
 */
export type EmptyDocument = Record<string, never>;

/**
 * @description HTTP status codes.
 */
export type StatusCodes = 200 | 201 | 204 | 205 | 400 | 403 | 404 | 500;

/**
 * @description Context string format: ClassName/MethodName
 */
export type ContextString = `${string}/${string}`;

/**
 * @descritpion Ingredient type
 */
export type IngredientType = {
    name: IngredientName,
    unit: string,
    amount?: number
};

/**
 * @description Language type
 */
export type Language = typeof supportedLanguages[number];

/**
 * @description Ingredient unit converter
 * @param multiplier number, 28.35
 * @param targetUnit string, g
 * @param targetUnitBorder number, 1000 - amount that requires conversion to superior unit
 * @param superiorUnit string, kg
 */
export interface IngredientUnitConverter {
    multiplier: number;
    targetUnit: string;
    targetUnitBorder: number,
    superiorUnit: string
}

/**
 * @description
 */