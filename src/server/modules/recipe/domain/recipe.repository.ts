import { DishId } from '../../dish/dish.types';
import { Language } from '../../../common/types';
import { RecipeEntity } from './entities';
import { CreateRecipeDto } from '../application/dtos/recipe.dto';

export interface RecipeRepository {
    create: (createRecipeDto: CreateRecipeDto) => Promise<RecipeEntity>;
    findByDishId: (dishId: DishId, language?: Language) => Promise<RecipeEntity | never>;
}