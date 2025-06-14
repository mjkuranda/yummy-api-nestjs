import { CapabilityType } from './user-capabilities.value-object';
import { UserEntity } from '../entities';
import { DishOverviewValueObject } from './dish-overview.value-object';

export class UserProfileValueObject {

    constructor(
        public readonly login: string,
        public readonly activated: number,
        public readonly isAdmin: boolean,
        public readonly capabilities: Record<CapabilityType, boolean>,
        public readonly dishList: DishOverviewValueObject[]
    ) {}

    static fromEntity(entity: UserEntity, dishes: DishOverviewValueObject[]): UserProfileValueObject {
        return new UserProfileValueObject(
            entity.getLogin(),
            entity.getActivationTime(),
            entity.isAdmin(),
            entity.getCapabilitiesAsObject(),
            dishes
        );
    }
}