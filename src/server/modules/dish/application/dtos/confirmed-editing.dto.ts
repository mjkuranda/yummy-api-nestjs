import { DishDetailsVo } from '../../domain/read/vos';

export class ConfirmedEditingDto {

    constructor(
        public readonly editedDish: DishDetailsVo
    ) {}

}