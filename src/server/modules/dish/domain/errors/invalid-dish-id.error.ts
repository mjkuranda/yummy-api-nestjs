import { EncodedDishIdValueObject } from '../common/value-objects';

export class InvalidDishIdError extends Error {

    constructor(encodedDishId: EncodedDishIdValueObject) {
        super(`Invalid "${encodedDishId}" encoded dish id.`);
    }

}