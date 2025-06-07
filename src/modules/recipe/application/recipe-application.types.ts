import { Language } from '../../../common/types';
import { DishRecipeSections } from '../../dish/dish.types';

export interface GetRecipeResult {
    recipe: DishRecipe;
    fromCache?: boolean;
}

export interface DishRecipe {
    language: Language;
    dishId: string;
    sections: DishRecipeSections;
}