import { DishEntity } from '../../common/entities';

export class DishRatingValueObject {

    constructor(
        private readonly dishEntity: DishEntity,
        public readonly averageRating: number,
        public readonly ratingNumber: number
    ) {}

}