import { Language } from '../../../common/types';
import { RecipeEntity } from '../domain/entities';
import { DishRecipeSection } from '../../../common/types';

export interface GetRecipeResult {
    recipe: RecipeEntity;
    fromCache?: boolean;
}

export interface DishRecipe {
    language: Language;
    dishId: string;
    sections: DishRecipeSection[];
}