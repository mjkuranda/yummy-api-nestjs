import { Document } from 'mongoose';
import { Language } from '../../../../server/common/types';
import { DishRecipeSection } from '../../../../server/common/types';

export interface DishRecipeDocument extends Document {
    readonly language: Language;
    readonly dishId: string;
    readonly sections: DishRecipeSection[];
}