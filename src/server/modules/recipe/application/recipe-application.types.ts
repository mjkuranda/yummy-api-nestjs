import { Language } from '../../../common/types';
import { DishRecipeSection } from '../../../common/types';

export interface DishRecipe {
    language: Language;
    dishId: string;
    sections: DishRecipeSection[];
}