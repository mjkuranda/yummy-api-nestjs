import { EncodedDishId } from '../../modules/dish/domain/common/encoded-dish-id.value-object';

export class DishRecipeExistsError extends Error {

    constructor(encodedDishId: EncodedDishId) {
        super(`Recipe already exists for this specific dish "${encodedDishId.getValue()}"`);
    }
}