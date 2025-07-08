import { EncodedDishIdVo } from '../../domain/common/vos';

export class CreatedDishDto {

    constructor(
        public readonly encodedDishId: EncodedDishIdVo,
        public readonly title: string,
        public readonly author: string
    ) {}

}