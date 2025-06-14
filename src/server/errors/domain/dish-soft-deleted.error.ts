import { EncodedDishIdValueObject } from '../../modules/dish/domain/common/value-objects';

export class DishSoftDeletedError extends Error {

    constructor(encodedDishId: EncodedDishIdValueObject) {
        super(`Dish with id "${encodedDishId.getValue()}" id is labeled to be deleted. Therefore, it is impossible to see its content.`);
    }
}