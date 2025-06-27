import { CapabilityType } from './domain/types';

export class UserDto {
    readonly _id: string;
    readonly email: string;
    readonly login: string;
    readonly password: string;
    readonly isAdmin?: boolean;
    readonly capabilities?: Record<CapabilityType, boolean>;
}