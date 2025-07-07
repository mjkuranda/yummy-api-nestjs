import { EncodedDishIdValueObject } from '../../domain/common/value-objects';

export class CreatedDishDto {

    constructor(
        public readonly encodedDishId: EncodedDishIdValueObject,
        public readonly title: string,
        public readonly author: string
    ) {}

}