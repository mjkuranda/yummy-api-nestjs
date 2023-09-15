import { Document } from 'mongoose';

export interface MealDocument extends Document {
  readonly author: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly ingredients: string[];
  readonly posted: number;
  readonly title: string;
  readonly type: string;
  readonly softAdded?: boolean;
  readonly softDeleted?: boolean;
  readonly softEdited?: MealDocument;
}
