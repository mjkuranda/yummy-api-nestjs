import { Language } from '../../common/types';
import { DishRecipeSections } from '../dish/dish.types';

export interface DishRecipe {
    language: Language;
    dishId: string;
    sections: DishRecipeSections;
}