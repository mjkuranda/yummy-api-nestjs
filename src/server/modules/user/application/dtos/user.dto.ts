import { CapabilityType } from '../../domain/types';

export class UserDto {

    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly login: string,
        public readonly isAdmin?: boolean,
        public readonly capabilities?: Record<CapabilityType, boolean>
    ) {}
}