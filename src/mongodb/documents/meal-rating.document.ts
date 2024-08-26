import { Document } from 'mongoose';

export interface MealRatingDocument extends Document {
    readonly mealId: string;
    readonly user: string;
    readonly rating: number;
    readonly posted: number;
}
