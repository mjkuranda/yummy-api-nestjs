import { DishCommentVo } from '../../domain/read/vos';
import { DishCommentDto, GetDishCommentsDto } from '../dtos';

export class DishCommentDtoMapper {

    constructor(
        public readonly encodedDishId: string,
        public readonly author: string,
        public readonly content: string,
        public readonly posted: number
    ) {}

    static toGetDishCommentsDto(encodedDishId: string, dishCommentVos: DishCommentVo[]): GetDishCommentsDto {
        const dishCommentDtos = dishCommentVos.map(dishCommentVo => this.toDishCommentDto(encodedDishId, dishCommentVo));

        return new GetDishCommentsDto(
            dishCommentDtos,
            dishCommentDtos.length
        );
    }

    static toDishCommentDto(encodedDishId: string, dishCommentVo: DishCommentVo): DishCommentDto {
        return new DishCommentDto(
            encodedDishId,
            dishCommentVo.author,
            dishCommentVo.content,
            dishCommentVo.posted
        );
    }
}