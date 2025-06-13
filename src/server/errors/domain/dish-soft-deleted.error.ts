import { EncodedDishId } from '../../modules/dish/domain/common/encoded-dish-id.value-object';

export class DishSoftDeletedError extends Error {

    constructor(encodedDishId: EncodedDishId) {
        super(`Dish with id "${encodedDishId}" id is labeled to be deleted. Therefore, it is impossible to see its content.`);
    }
}