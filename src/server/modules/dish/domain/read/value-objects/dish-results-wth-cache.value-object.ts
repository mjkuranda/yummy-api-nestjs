import { DishResultValueObject } from './dish-result.value-object';

export class DishResultsWithCacheValueObject {

    constructor(
        public readonly dishResultsVos: DishResultValueObject[],
        public readonly fromCache: boolean
    ) {}
}