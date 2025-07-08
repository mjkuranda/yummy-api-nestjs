import { CapabilityType } from '../../domain/vos';
import { DishOverviewDto } from './dish-overview.dto';

export class GetUserProfileDto {

    constructor(
        public readonly login: string,
        public readonly activated: number,
        public readonly isAdmin: boolean,
        public readonly capabilities: Record<CapabilityType, boolean>,
        public readonly dishDtos: DishOverviewDto[]
    ) {}
}