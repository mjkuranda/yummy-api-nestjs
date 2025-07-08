import { DishResultVo } from './vos';
import { MealType } from '../../../../common/enums';

/**
 * @description returns true if the dish matches the given meal type, or if no meal type is specified
 * @param dish one of dishes to filter
 * @param [mealType] a filter defined as a meal type
 * @returns filtered dishes
 */
export function filterByMealType(dish: DishResultVo, mealType?: MealType): boolean {
    if (!mealType) {
        return true;
    }

    return dish.mealType === mealType;
}

/**
 * @description returns true if the dish's relevance is greater than zero
 * @param dish dish to check
 * @returns dish that at least one ingredient is matched
 */
export function filterGreaterThanZeroRelevance(dish: DishResultVo): boolean {
    return dish.relevance > 0;
}

/**
 * @description sort comparator for dishes by descending relevance
 * @param dish0 first dish to compare
 * @param dish1 second dish to compare
 * @returns sort value defining order
 */
export function sortDescendingRelevance(dish0: DishResultVo, dish1: DishResultVo): number {
    return dish1.relevance - dish0.relevance;
}