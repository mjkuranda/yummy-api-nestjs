import { DishEntity } from '../../domain/common/entities';

export class ConfirmedEditingDto {

    constructor(
        public readonly editedDish: DishEntity
    ) {}

}