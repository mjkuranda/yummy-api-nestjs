import { MealRecipeSections } from '../meal/meal.types';

export interface TranslatedIngredient {
    text: string;
    imageUrl: string;
}

export interface TranslatedDetailedMeal {
    description: string;
    ingredients: TranslatedIngredient[];
    recipe: MealRecipeSections;
}