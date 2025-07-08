import { EncodedDishIdVo } from '../common/vos';

export class DishNotAcceptedError extends Error {

    constructor(encodedDishId: EncodedDishIdVo) {
        super(`Dish with id "${encodedDishId.getValue()}" id was not confirmed by admin. Therefore, it is impossible to see its content.`);
    }
}