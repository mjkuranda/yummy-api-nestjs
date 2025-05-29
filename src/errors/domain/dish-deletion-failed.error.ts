import { EncodedDishId } from '../../common/types';

export class DishDeletionFailedError extends Error {

    constructor(encodedDishId: EncodedDishId) {
        super(`Failed to mark dish "${encodedDishId}" as a soft-deleted.`);
    }

}