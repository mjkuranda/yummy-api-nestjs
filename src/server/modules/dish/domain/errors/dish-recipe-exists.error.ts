import { EncodedDishIdVo } from '../common/vos';

export class DishRecipeExistsError extends Error {

    constructor(encodedDishId: EncodedDishIdVo) {
        super(`Recipe already exists for this specific dish "${encodedDishId.getValue()}"`);
    }
}