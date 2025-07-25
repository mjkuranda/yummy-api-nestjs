import { DishCommentEntity, DishEntity } from '../../common/entities';

export class DishCommentVo {

    constructor(
        public readonly encodedDishId: string,
        public readonly author: string,
        public readonly content: string,
        public readonly posted: number
    ) {}

    static fromEntities(encodedDishId: string, dish: DishEntity, comments: DishCommentEntity[]): DishCommentVo[] {
        const author = dish.getAuthor();

        return comments.map(comment => ({
            encodedDishId,
            author,
            content: comment.getText(),
            posted: comment.getPostedTime()
        }));
    }
}