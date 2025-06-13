import { Document } from 'mongoose';

export interface DishRatingDocument extends Document {
    readonly dishId: string;
    readonly user: string;
    readonly rating: number;
    readonly posted: number;
}
