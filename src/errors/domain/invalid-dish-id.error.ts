import { EncodedDishId } from '../../modules/dish/encoded-dish-id.value-object';

export class InvalidDishIdError extends Error {

    constructor(encodedDishId: EncodedDishId) {
        super(`Invalid "${encodedDishId}" encoded dish id.`);
    }

}