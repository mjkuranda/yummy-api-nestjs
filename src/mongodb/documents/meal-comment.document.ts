import { Document } from 'mongoose';

export interface MealCommentDocument extends Document {
    readonly mealId: string;
    readonly user: string;
    readonly text: string;
    readonly posted: number;
}
