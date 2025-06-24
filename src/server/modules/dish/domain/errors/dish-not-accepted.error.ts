import { EncodedDishIdValueObject } from '../common/value-objects';

export class DishNotAcceptedError extends Error {

    constructor(encodedDishId: EncodedDishIdValueObject) {
        super(`Dish with id "${encodedDishId.getValue()}" id was not confirmed by admin. Therefore, it is impossible to see its content.`);
    }
}