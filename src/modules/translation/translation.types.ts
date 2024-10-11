import { DishRecipeSections } from '../dish/dish.types';

export interface TranslatedIngredient {
    text: string;
    imageUrl: string;
}

export interface TranslatedDetailedDish {
    description: string;
    ingredients: TranslatedIngredient[];
    recipe: DishRecipeSections;
}