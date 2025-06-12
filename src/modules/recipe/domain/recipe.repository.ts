import { DishId, DishRecipeSections } from '../../dish/dish.types';
import { Language } from '../../../common/types';
import { Recipe } from './entities';

export interface RecipeRepository {
    findByDishId: (dishId: DishId, language: Language) => Promise<Recipe | never>;
    create: (dishId: DishId, language: Language, sections: DishRecipeSections) => Promise<Recipe>;
}