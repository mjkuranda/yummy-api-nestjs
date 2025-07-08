import { DishDetailsVo } from './dish-details.vo';

export class DishDetailsWithCacheVo {

    constructor(
        public readonly dishDetailsVo: DishDetailsVo,
        public readonly fromCache: boolean
    ) {}
}