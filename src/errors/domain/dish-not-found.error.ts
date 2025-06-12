import { EncodedDishId } from '../../modules/dish/domain/common/encoded-dish-id.value-object';

export class DishNotFoundError extends Error {

    constructor(encodedDishId: EncodedDishId) {
        super(`Not found dish with ${encodedDishId.getValue()} id.`);
    }
}