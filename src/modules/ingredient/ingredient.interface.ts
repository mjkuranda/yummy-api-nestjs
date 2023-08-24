import { Document } from 'mongoose';

export interface IngredientDocument extends Document {
    readonly name: string;
    readonly category: string; // TODO: Category type
}
