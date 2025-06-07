import { Language } from '../../../common/types';
import { DishRecipeSections } from '../../dish/dish.types';
import { Recipe } from '../domain/entities';

export interface GetRecipeResult {
    recipe: Recipe;
    fromCache?: boolean;
}

export interface DishRecipe {
    language: Language;
    dishId: string;
    sections: DishRecipeSections;
}