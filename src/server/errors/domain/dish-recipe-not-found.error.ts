import { EncodedDishId } from '../../modules/dish/domain/common/encoded-dish-id.value-object';

export class DishRecipeNotFoundError extends Error {

    constructor(encodedDishId: EncodedDishId) {
        super(`Recipe for "${encodedDishId}" dish has not been found`);
    }
}