import { RatedDish } from './dish.types';
import { MealType } from '../../common/enums';

export function filterByMealType(dish: RatedDish, mealType?: MealType): boolean {
    if (!mealType) {
        return true;
    }

    return dish.mealType === mealType;
}

export function filterGreaterThanZeroRelevance(dish: RatedDish): boolean {
    return dish.relevance > 0;
}

export function sortDescendingRelevance(dish1: RatedDish, dish2: RatedDish): number {
    return dish2.relevance - dish1.relevance;
}