import { EncodedDishIdValueObject } from '../common/value-objects';

export class DishDeletionFailedError extends Error {

    constructor(encodedDishId: EncodedDishIdValueObject) {
        super(`Failed to mark dish "${encodedDishId.getValue()}" as a soft-deleted.`);
    }

}