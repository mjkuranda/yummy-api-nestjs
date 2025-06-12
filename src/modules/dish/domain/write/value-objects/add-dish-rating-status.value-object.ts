export class AddDishRatingStatusValueObject {

    constructor(private readonly isNew: boolean) {}

    isNewRating(): boolean {
        return this.isNew;
    }

}