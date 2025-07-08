import { EncodedDishIdVo } from '../common/vos';

export class DishSoftDeletedError extends Error {

    constructor(encodedDishId: EncodedDishIdVo) {
        super(`Dish with id "${encodedDishId.getValue()}" id is labeled to be deleted. Therefore, it is impossible to see its content.`);
    }
}