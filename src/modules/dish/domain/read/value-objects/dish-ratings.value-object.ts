import { DishEntity } from '../../common/entities';

export class DishRatingsValueObject {

    constructor(
        private readonly dishEntity: DishEntity,
        private readonly averageRating: number,
        private readonly ratingNumber: number
    ) {}

    getAverageRating(): number {
        return this.averageRating;
    }

    getRatingNumber() {
        return this.ratingNumber;
    }

}