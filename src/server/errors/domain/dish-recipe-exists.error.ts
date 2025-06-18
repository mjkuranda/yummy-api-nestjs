import { EncodedDishIdValueObject } from '../../modules/dish/domain/common/value-objects';

export class DishRecipeExistsError extends Error {

    constructor(encodedDishId: EncodedDishIdValueObject) {
        super(`Recipe already exists for this specific dish "${encodedDishId.getValue()}"`);
    }
}