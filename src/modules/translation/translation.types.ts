import { Recipe } from '../recipe/domain/entities';

export interface TranslatedIngredient {
    text: string;
    imageUrl: string;
}

export interface TranslatedDetailedDish {
    description: string;
    ingredients: TranslatedIngredient[];
}

export interface TranslatedRecipe {
    original: Recipe,
    translated: Recipe
}