import { DishDetailsValueObject } from './dish-details.value-object';

export class DishDetailsWithCacheValueObject {

    constructor(
        public readonly dishDetailsVo: DishDetailsValueObject,
        public readonly fromCache: boolean
    ) {}
}