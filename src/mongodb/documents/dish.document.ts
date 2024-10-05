import { Document } from 'mongoose';
import { DishIngredient } from '../../modules/ingredient/ingredient.types';
import { DishRecipeSections } from '../../modules/dish/dish.types';
import { Language } from '../../common/types';
import { MealType, DishType } from '../../common/enums';

export interface DishDocument extends Document {
  readonly author: string;
  readonly description: string;
  readonly dishType: DishType;
  readonly imageUrl: string;
  readonly ingredients: DishIngredient[];
  readonly language: Language;
  readonly posted: number;
  readonly title: string;
  readonly type: MealType;
  readonly softAdded?: boolean;
  readonly softDeleted?: boolean;
  readonly softEdited?: DishDocument;
  readonly readyInMinutes: number;
  readonly recipeSections: DishRecipeSections;
}
