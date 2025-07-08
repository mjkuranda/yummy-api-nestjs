import { DishResultVo } from './dish-result.vo';

export class DishResultsWithCacheVo {

    constructor(
        public readonly dishResultsVos: DishResultVo[],
        public readonly fromCache: boolean
    ) {}
}