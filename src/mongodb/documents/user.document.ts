import { Document } from 'mongoose';
import { UserCapabilities } from '../../modules/user/user.types';

export interface UserDocument extends Document {
    readonly email: string;
    readonly login: string;
    readonly password: string;
    readonly salt: string;
    readonly isAdmin?: boolean;
    readonly capabilities?: Partial<UserCapabilities>;
    readonly activated?: number;
}