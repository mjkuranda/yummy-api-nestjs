import { DishEntity } from '../../common/entities';

export class DishRatingVo {

    constructor(
        private readonly dishEntity: DishEntity,
        public readonly averageRating: number,
        public readonly ratingNumber: number
    ) {}

}