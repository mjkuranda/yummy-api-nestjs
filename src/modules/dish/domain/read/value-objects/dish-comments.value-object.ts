import { DishCommentEntity, DishEntity } from '../../common/entities';

export class DishCommentsValueObject {

    constructor(
        private readonly dishEntity: DishEntity,
        private readonly dishCommentEntities: DishCommentEntity[]
    ) {}
}