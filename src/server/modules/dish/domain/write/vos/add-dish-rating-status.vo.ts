export class AddDishRatingStatusVo {

    constructor(private readonly isNew: boolean) {}

    isNewRating(): boolean {
        return this.isNew;
    }

}