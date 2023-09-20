import { CapabilityType } from './user.types';

export class UserDto {
    readonly _id: string;
    readonly email: string;
    readonly login: string;
    readonly password: string;
    readonly isAdmin?: boolean;
    readonly capabilities?: Record<CapabilityType, boolean>;
}

export class UserLoginDto {
    readonly login: string;
    readonly password: string;
}

export class CreateUserDto {
    readonly email: string;
    readonly login: string;
    readonly password: string;
}