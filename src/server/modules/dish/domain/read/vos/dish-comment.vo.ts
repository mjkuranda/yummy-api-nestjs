import { EncodedDishIdVo } from '../../common/vos';
import { DishCommentEntity, DishEntity } from '../../common/entities';

export class DishCommentVo {

    constructor(
        public readonly encodedDishIdVo: EncodedDishIdVo,
        public readonly author: string,
        public readonly content: string,
        public readonly posted: number
    ) {}

    static fromEntities(dish: DishEntity, comments: DishCommentEntity[]): DishCommentVo[] {
        const encodedDishIdVo = dish.getEncodedDishId();
        const author = dish.getAuthor();

        return comments.map(comment => ({
            encodedDishIdVo,
            author,
            content: comment.getText(),
            posted: comment.getPostedTime()
        }));
    }
}