import { Document } from 'mongoose';

export interface UserDocument extends Document {
    readonly login: string;
    readonly password: string;
}