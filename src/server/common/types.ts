import { Provider, IngredientName, Repository } from './enums';
import { supportedLanguages } from '../constants/language.constant';
import { Providable } from './interfaces';
import { DishRepository } from '../modules/dish/domain/dish.repository';
import { RecipeRepository } from '../modules/recipe/domain/recipe.repository';
import {
    DishCommentRepository,
    DishRatingRepository,
    UserSearchQueryRepository
} from '../modules/dish/domain/common/repositories';
import { UserActionRepository, UserRepository } from '../modules/user/domain/repositories';

/**
 * @description Equals to {}
 */
export type EmptyDocument = Record<string, unknown>;

// FIXME: Deprecated. Use HttpStatus or HttpCode
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
 * @description All providers map type
 */
export type ProviderMap = Record<Provider, Providable>;

/**
 * @description Dish and recipe repositories
 */
export type RepositoryMap = {
    [Repository.DISH_REPOSITORY]: DishRepository,
    [Repository.DISH_COMMENT_REPOSITORY]: DishCommentRepository,
    [Repository.DISH_RATING_REPOSITORY]: DishRatingRepository,
    [Repository.RECIPE_REPOSITORY]: RecipeRepository,
    [Repository.USER_REPOSITORY]: UserRepository,
    [Repository.USER_ACTION_REPOSITORY]: UserActionRepository,
    [Repository.USER_SEARCH_QUERY_REPOSITORY]: UserSearchQueryRepository
};