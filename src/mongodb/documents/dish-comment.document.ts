import { Document } from 'mongoose';

export interface DishCommentDocument extends Document {
    readonly dishId: string;
    readonly user: string;
    readonly text: string;
    readonly posted: number;
}
