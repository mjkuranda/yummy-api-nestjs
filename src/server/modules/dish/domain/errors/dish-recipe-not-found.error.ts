import { EncodedDishIdVo } from '../common/vos';

export class DishRecipeNotFoundError extends Error {

    constructor(encodedDishId: EncodedDishIdVo) {
        super(`Recipe for "${encodedDishId}" dish has not been found`);
    }
}