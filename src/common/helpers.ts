import { SpoonacularIngredient } from '../modules/api/spoonacular/spoonacular.api.types';
import { RatedDish } from '../modules/dish/dish.types';
import { DishType } from './enums';

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

export function calculateCheckingAgain(providedIngredients: string[], usedIngredients: SpoonacularIngredient[], missedIngredients: SpoonacularIngredient[]): { relevance: number, missingCount: number } {
    const mealIngredients = [...usedIngredients.map(ing => ing.name), ...missedIngredients.map(ing => ing.name)];

    return {
        relevance: calculateRelevance(providedIngredients, mealIngredients),
        missingCount: calculateMissing(providedIngredients, mealIngredients)
    };
}

export function sortDescendingRelevance(meal1: RatedDish, meal2: RatedDish): number {
    return meal2.relevance - meal1.relevance;
}

export function convertAmountToText(amount: number): string {
    if (amount === 0.33333334) {
        return '1/3';
    }

    if (amount === 0.66666667) {
        return '2/3';
    }

    if (amount === 0.5) {
        return '1/2';
    }

    if (amount === 0.25) {
        return '1/4';
    }

    if (amount === 0.5) {
        return '2/4';
    }

    if (amount === 0.75) {
        return '3/4';
    }

    return amount.toString();
}

export function compoundTextToTranslate(textAmount: string, unit: string, name: string): string {
    if (unit === '') {
        return `${textAmount} ${name}`;
    }

    return `${textAmount} ${unit} of ${name}`;
}

// Removes e.g. `.4 oz. butter` leaving `butter` only
export function normalizeName(name: string): string {
    return name.replace(/\..*?\./, '').trim();
}

export function normalizeUnit(amount: number, unit: string): string {
    if (unit === 'gr') {
        return amount > 1 ? 'grams' : 'gram';
    }

    return unit;
}

export function inferDishType(mealTitle: string): DishType {
    const title = mealTitle.toLowerCase();

    if (title.includes('soup') || title.includes('stew')) {
        return DishType.SOUP;
    }

    if (title.includes('salad')) {
        return DishType.SALAD;
    }

    if (title.includes('main dish')) {
        return DishType.MAIN_COURSE;
    }

    return DishType.ANY;
}