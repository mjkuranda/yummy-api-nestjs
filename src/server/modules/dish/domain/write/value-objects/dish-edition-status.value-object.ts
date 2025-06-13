export class DishEditionStatusValueObject {

    constructor(
        public readonly dishTitle: string
    ) {}

    getTitle(): string {
        return this.dishTitle;
    }

}