import { Document } from 'mongoose';
import { CapabilityType } from './user.types';

export interface UserDocument extends Document {
    readonly login: string;
    readonly password: string;
    readonly isAdmin?: boolean;
    readonly capabilities?: Record<keyof CapabilityType, boolean>;
}