import { DishResultValueObject } from './domain/read/value-objects';
import { MealType } from '../../common/enums';

export function filterByMealType(dish: DishResultValueObject, mealType?: MealType): boolean {
    if (!mealType) {
        return true;
    }

    return dish.mealType === mealType;
}

export function filterGreaterThanZeroRelevance(dish: DishResultValueObject): boolean {
    return dish.relevance > 0;
}

export function sortDescendingRelevance(dish1: DishResultValueObject, dish2: DishResultValueObject): number {
    return dish2.relevance - dish1.relevance;
}