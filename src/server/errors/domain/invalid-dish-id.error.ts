import { EncodedDishIdValueObject } from '../../modules/dish/domain/common/value-objects';

export class InvalidDishIdError extends Error {

    constructor(encodedDishId: EncodedDishIdValueObject) {
        super(`Invalid "${encodedDishId}" encoded dish id.`);
    }

}