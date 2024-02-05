import { Document } from 'mongoose';
import { CapabilityType } from '../../modules/user/user.types';

export interface UserDocument extends Document {
    readonly email: string;
    readonly login: string;
    readonly password: string;
    readonly isAdmin?: boolean;
    readonly capabilities?: Record<keyof CapabilityType, boolean>;
    readonly activated?: number;
}