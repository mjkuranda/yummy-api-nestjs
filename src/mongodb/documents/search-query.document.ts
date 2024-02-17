import { Document } from 'mongoose';

export interface SearchQueryDocument extends Document {
    readonly ingredients: string[];
    readonly date: Date;
    readonly login: string;
}