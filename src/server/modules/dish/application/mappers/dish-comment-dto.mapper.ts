import { DishCommentValueObject } from '../../domain/read/value-objects';
import { EncodedDishIdValueObject } from '../../domain/common/value-objects';
import { DishCommentDto, GetDishCommentsDto } from '../dtos';

export class DishCommentDtoMapper {

    constructor(
        public readonly encodedDishIdVo: EncodedDishIdValueObject,
        public readonly author: string,
        public readonly content: string,
        public readonly posted: number
    ) {}

    static toGetDishCommentsDto(dishCommentVos: DishCommentValueObject[]): GetDishCommentsDto {
        const dishCommentDtos = dishCommentVos.map(dishCommentVo => this.toDishCommentDto(dishCommentVo));

        return new GetDishCommentsDto(
            dishCommentDtos,
            dishCommentDtos.length
        );
    }

    static toDishCommentDto(dishCommentVo: DishCommentValueObject): DishCommentDto {
        return new DishCommentDto(
            dishCommentVo.encodedDishIdVo.getValue(),
            dishCommentVo.author,
            dishCommentVo.content,
            dishCommentVo.posted
        );
    }
}