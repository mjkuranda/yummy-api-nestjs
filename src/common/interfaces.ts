import { UserAccessTokenPayload } from '../modules/jwt-manager/jwt-manager.types';
import { DetailedDish, RatedDish } from '../modules/dish/dish.types';
import { DishProvider, MealType } from './enums';
import { EncodedDishId } from './types';

/**
 * @description Transformed endpoint body
 */
export interface TransformedBody<TData> {
    data: TData;
    authenticatedUser: UserAccessTokenPayload;
}

/**
 * @description Interface for providing dishes
 */
export interface DishProvidable {
    /**
     * @description Returns provider name
     */
    getProvider(): DishProvider;

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
    getDishDetails(encodedDishId: EncodedDishId): Promise<DetailedDish | null>;
}