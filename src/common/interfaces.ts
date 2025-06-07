import { UserAccessTokenPayload } from '../modules/jwt-manager/jwt-manager.types';
import { RatedDish } from '../modules/dish/dish.types';
import { MealType, Provider } from './enums';
import { Language } from './types';
import { DishDetailsWithMetadata } from '../modules/dish/read/dish-read.types';
import { Recipe } from '../modules/recipe/domain/entities';
import { EncodedDishId } from '../modules/dish/encoded-dish-id.value-object';

/**
 * @description Transformed endpoint body
 */
export interface TransformedBody<TData> {
    data: TData;
    authenticatedUser: UserAccessTokenPayload;
}

export interface Providable extends DishProvidable, RecipeProvidable {
    /**
     * @description Returns provider name
     */
    getProvider(): Provider;
}

/**
 * @description Interface for providing dishes
 */
export interface DishProvidable {
    /**
     * @description Returns dish collection on the basis of provided ingredients and meal type
     * @param providedIngredients list of ingredients
     * @param mealType filter dishes only with this meal type
     */
    getDishes(providedIngredients: string[], mealType?: MealType): Promise<RatedDish[]>;

    /**
     * @description Returns detailed dish
     * @param encodedDishId encoded dish ID and its provider name
     */
    getDishDetails(encodedDishId: EncodedDishId): Promise<DishDetailsWithMetadata | null>;
}

/**
 *  @description Interface for providing dish recipes
 */
export interface RecipeProvidable {
    /**
     * @description returns dish recipe
     * @param encodedDishId encoded dish ID and its provider name
     * @param language recipe language
     */
    getDishRecipe(encodedDishId: EncodedDishId, language?: Language): Promise<Recipe | null>;

    /**
     * @description returns list of language-prepared recipes
     * @param encodedDishId encoded dish ID and its provider name
     */
    getLanguage(encodedDishId: EncodedDishId): Language;
}

/**
 * @description Interface for handling use case service
 */
export interface Executable<TParams extends unknown[], TOutput> {
    /**
     * @description Executes use case scenario
     * @param params list of parameters used to execute a scenario
     */
    execute(...params: TParams): Promise<TOutput>;
}