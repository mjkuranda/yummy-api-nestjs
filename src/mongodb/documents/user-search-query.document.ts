import { Document } from 'mongoose';

export interface UserSearchQueryDocument extends Document {
    readonly ingredients: string[];
    readonly date: Date;
    readonly login: string;
}