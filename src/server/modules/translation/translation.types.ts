import { RecipeEntity } from '../recipe/domain/entities';

export interface TranslatedIngredient {
    text: string;
    imageUrl: string;
}

export interface TranslatedDetailedDish {
    description: string;
    ingredients: TranslatedIngredient[];
}

export interface TranslatedRecipe {
    original: RecipeEntity,
    translated: RecipeEntity
}