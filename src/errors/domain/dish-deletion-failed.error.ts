import { EncodedDishId } from '../../modules/dish/encoded-dish-id.value-object';

export class DishDeletionFailedError extends Error {

    constructor(encodedDishId: EncodedDishId) {
        super(`Failed to mark dish "${encodedDishId}" as a soft-deleted.`);
    }

}