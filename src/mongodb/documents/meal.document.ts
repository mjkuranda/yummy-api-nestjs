import { Document } from 'mongoose';
import { MealIngredient } from '../../modules/ingredient/ingredient.types';
import { MealRecipeSections } from '../../modules/meal/meal.types';
import { Language } from '../../common/types';

export interface MealDocument extends Document {
  readonly author: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly ingredients: MealIngredient[];
  readonly language: Language;
  readonly posted: number;
  readonly title: string;
  readonly type: string;
  readonly softAdded?: boolean;
  readonly softDeleted?: boolean;
  readonly softEdited?: MealDocument;
  readonly readyInMinutes: number;
  readonly recipeSections: MealRecipeSections;
}
