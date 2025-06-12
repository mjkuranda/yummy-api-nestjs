import { EncodedDishId } from '../../modules/dish/domain/common/encoded-dish-id.value-object';

export class InvalidDishIdError extends Error {

    constructor(encodedDishId: EncodedDishId) {
        super(`Invalid "${encodedDishId}" encoded dish id.`);
    }

}