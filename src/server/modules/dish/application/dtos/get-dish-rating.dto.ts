export class GetDishRatingDto {

    constructor(
        public averageRating: number,
        public ratingCount: number
    ) {}

}