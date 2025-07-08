import { CapabilityType } from './user-capabilities.vo';
import { UserEntity } from '../entities';
import { DishOverviewVo } from './dish-overview.vo';

export class UserProfileVo {

    constructor(
        public readonly login: string,
        public readonly activated: number,
        public readonly isAdmin: boolean,
        public readonly capabilities: Record<CapabilityType, boolean>,
        public readonly dishList: DishOverviewVo[]
    ) {}

    static fromEntity(entity: UserEntity, dishes: DishOverviewVo[]): UserProfileVo {
        return new UserProfileVo(
            entity.getLogin(),
            entity.getActivationTime(),
            entity.isAdmin(),
            entity.getCapabilitiesAsObject(),
            dishes
        );
    }
}