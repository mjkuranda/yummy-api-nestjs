import { DishCommentVo } from '../../domain/read/vos';
import { EncodedDishIdVo } from '../../domain/common/vos';
import { DishCommentDto, GetDishCommentsDto } from '../dtos';

export class DishCommentDtoMapper {

    constructor(
        public readonly encodedDishIdVo: EncodedDishIdVo,
        public readonly author: string,
        public readonly content: string,
        public readonly posted: number
    ) {}

    static toGetDishCommentsDto(dishCommentVos: DishCommentVo[]): GetDishCommentsDto {
        const dishCommentDtos = dishCommentVos.map(dishCommentVo => this.toDishCommentDto(dishCommentVo));

        return new GetDishCommentsDto(
            dishCommentDtos,
            dishCommentDtos.length
        );
    }

    static toDishCommentDto(dishCommentVo: DishCommentVo): DishCommentDto {
        return new DishCommentDto(
            dishCommentVo.encodedDishIdVo.getValue(),
            dishCommentVo.author,
            dishCommentVo.content,
            dishCommentVo.posted
        );
    }
}