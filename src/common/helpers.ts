import { SpoonacularIngredient } from '../modules/api/spoonacular/spoonacular.api.types';
import { RatedMeal } from '../modules/meal/meal.types';

export function toFixNumber(relevance: number): number {
    const fixed = relevance.toFixed(2);

    return Number(fixed);
}

export function calculateRelevance(providedIngredients: string[], mealIngredients: string[]): number {
    if (!mealIngredients.length) {
        return 0;
    }

    const matchingIngredients = mealIngredients.reduce((acc, curr) => acc + (providedIngredients.includes(curr) ? 1 : 0), 0);

    return toFixNumber(matchingIngredients / mealIngredients.length);
}

export function calculateMissing(providedIngredients: string[], mealIngredients: string[]): number {
    if (!mealIngredients.length) {
        return 0;
    }

    const matchingIngredients = mealIngredients.reduce((acc, curr) => acc + (providedIngredients.includes(curr) ? 1 : 0), 0);

    return mealIngredients.length - matchingIngredients;
}

export function calculateRelevanceUsingLength(usedIngredients: SpoonacularIngredient[], missedIngredients: SpoonacularIngredient[]): number {
    const relevance = usedIngredients.length / (usedIngredients.length + missedIngredients.length);

    return toFixNumber(relevance);
}

export function sortDescendingRelevance(meal1: RatedMeal, meal2: RatedMeal): number {
    return meal2.relevance - meal1.relevance;
}