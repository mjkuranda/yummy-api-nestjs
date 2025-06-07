import { DishRecipe } from '../recipe/application/recipe-application.types';

export interface TranslatedIngredient {
    text: string;
    imageUrl: string;
}

export interface TranslatedDetailedDish {
    description: string;
    ingredients: TranslatedIngredient[];
}

export interface TranslatedRecipe {
    original: DishRecipe,
    translated: DishRecipe
}