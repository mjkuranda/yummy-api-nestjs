import { EncodedDishIdValueObject } from '../common/value-objects';

export class DishNotFoundError extends Error {

    constructor(encodedDishId: EncodedDishIdValueObject) {
        super(`Not found dish with ${encodedDishId.getValue()} id.`);
    }
}