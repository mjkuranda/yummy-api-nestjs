import { EncodedDishIdValueObject } from '../../modules/dish/domain/common/value-objects';

export class DishRecipeNotFoundError extends Error {

    constructor(encodedDishId: EncodedDishIdValueObject) {
        super(`Recipe for "${encodedDishId}" dish has not been found`);
    }
}