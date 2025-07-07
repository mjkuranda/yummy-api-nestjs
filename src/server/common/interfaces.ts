import { MealType, Provider } from './enums';
import { Language } from './types';
import { RecipeEntity } from '../modules/recipe/domain/entities';
import { EncodedDishIdValueObject } from '../modules/dish/domain/common/value-objects';
import { DishDetailsValueObject, DishResultValueObject } from '../modules/dish/domain/read/value-objects';

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
    getDishes(providedIngredients: string[], mealType?: MealType): Promise<DishResultValueObject[]>;

    /**
     * @description Returns detailed dish
     * @param encodedDishId encoded dish ID and its provider name
     */
    getDishDetails(encodedDishId: EncodedDishIdValueObject): Promise<DishDetailsValueObject | null>;
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
    getDishRecipe(encodedDishId: EncodedDishIdValueObject, language?: Language): Promise<RecipeEntity | null>;

    /**
     * @description returns list of language-prepared recipes
     * @param encodedDishId encoded dish ID and its provider name
     */
    getLanguage(encodedDishId: EncodedDishIdValueObject): Language;
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