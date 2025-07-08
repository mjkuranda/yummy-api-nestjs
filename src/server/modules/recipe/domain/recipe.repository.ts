import { DishId } from '../../../common/types';
import { Language } from '../../../common/types';
import { RecipeEntity } from './entities';
import { CreateRecipeDto } from '../application/dtos';

export interface RecipeRepository {
    createRecipe: (createRecipeDto: CreateRecipeDto) => Promise<RecipeEntity>;
    findRecipeByDishId: (dishId: DishId, language?: Language) => Promise<RecipeEntity | never>;
}