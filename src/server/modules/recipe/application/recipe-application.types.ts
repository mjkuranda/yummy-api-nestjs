import { Language } from '../../../common/types';
import { DishRecipeSections } from '../../dish/dish.types';
import { RecipeEntity } from '../domain/entities';

export interface GetRecipeResult {
    recipe: RecipeEntity;
    fromCache?: boolean;
}

export interface DishRecipe {
    language: Language;
    dishId: string;
    sections: DishRecipeSections;
}