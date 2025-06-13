import { DishCommentDto } from './dish-comment.dto';

export class GetDishCommentsDto {

    constructor(
        public readonly comments: DishCommentDto[],
        public readonly count: number
    ) {}
}