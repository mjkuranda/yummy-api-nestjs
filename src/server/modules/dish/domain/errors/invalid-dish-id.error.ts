import { EncodedDishIdVo } from '../common/vos';

export class InvalidDishIdError extends Error {

    constructor(encodedDishId: EncodedDishIdVo) {
        super(`Invalid "${encodedDishId}" encoded dish id.`);
    }

}