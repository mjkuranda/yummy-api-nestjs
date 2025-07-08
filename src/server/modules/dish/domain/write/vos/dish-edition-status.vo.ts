export class DishEditionStatusVo {

    constructor(
        public readonly dishTitle: string
    ) {}

    getTitle(): string {
        return this.dishTitle;
    }

}