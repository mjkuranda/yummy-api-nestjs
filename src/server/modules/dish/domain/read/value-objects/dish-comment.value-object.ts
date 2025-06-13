import { EncodedDishIdValueObject } from '../../common/value-objects';
import { DishCommentEntity, DishEntity } from '../../common/entities';

export class DishCommentValueObject {

    constructor(
        public readonly encodedDishIdVo: EncodedDishIdValueObject,
        public readonly author: string,
        public readonly content: string,
        public readonly posted: number
    ) {}

    static fromEntities(dish: DishEntity, comments: DishCommentEntity[]): DishCommentValueObject[] {
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