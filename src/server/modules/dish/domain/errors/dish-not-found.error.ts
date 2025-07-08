import { EncodedDishIdVo } from '../common/vos';

export class DishNotFoundError extends Error {

    constructor(encodedDishId: EncodedDishIdVo) {
        super(`Not found dish with ${encodedDishId.getValue()} id.`);
    }
}