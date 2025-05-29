import { EncodedDishId } from '../../common/types';

export class InvalidDishIdError extends Error {

    constructor(encodedDishId: EncodedDishId) {
        super(`Invalid "${encodedDishId}" encoded dish id.`);
    }

}