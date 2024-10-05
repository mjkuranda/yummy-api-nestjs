import { DishRecipeSections } from '../dish/dish.types';

export interface TranslatedIngredient {
    text: string;
    imageUrl: string;
}

export interface TranslatedDetailedMeal {
    description: string;
    ingredients: TranslatedIngredient[];
    recipe: DishRecipeSections;
}