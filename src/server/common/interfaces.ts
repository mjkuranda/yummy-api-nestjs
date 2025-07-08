import { MealType, Provider } from './enums';
import { Language } from './types';
import { RecipeEntity } from '../modules/recipe/domain/entities';
import { EncodedDishIdVo } from '../modules/dish/domain/common/vos';
import { DishDetailsVo, DishResultVo } from '../modules/dish/domain/read/vos';

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
    getDishes(providedIngredients: string[], mealType?: MealType): Promise<DishResultVo[]>;

    /**
     * @description Returns detailed dish
     * @param encodedDishId encoded dish ID and its provider name
     */
    getDishDetails(encodedDishId: EncodedDishIdVo): Promise<DishDetailsVo | null>;
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
    getDishRecipe(encodedDishId: EncodedDishIdVo, language?: Language): Promise<RecipeEntity | null>;

    /**
     * @description returns list of language-prepared recipes
     * @param encodedDishId encoded dish ID and its provider name
     */
    getLanguage(encodedDishId: EncodedDishIdVo): Language;
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