import { EncodedDishId } from '../../modules/dish/domain/common/encoded-dish-id.value-object';

export class DishNotAcceptedError extends Error {

    constructor(encodedDishId: EncodedDishId) {
        super(`Dish with id "${encodedDishId.getValue()}" id was not confirmed by admin. Therefore, it is impossible to see its content.`);
    }
}