import { Document } from 'mongoose';
import { Language } from '../../common/types';
import { DishRecipeSections } from '../../modules/dish/dish.types';

export interface RecipeDocument extends Document {
    readonly language: Language;
    readonly dishId: string;
    readonly sections: DishRecipeSections;
}