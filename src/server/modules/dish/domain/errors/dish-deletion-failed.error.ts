import { EncodedDishIdVo } from '../common/vos';

export class DishDeletionFailedError extends Error {

    constructor(encodedDishId: EncodedDishIdVo) {
        super(`Failed to mark dish "${encodedDishId.getValue()}" as a soft-deleted.`);
    }

}