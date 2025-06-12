export class DishDeletionStatusValueObject {

    constructor(
        public readonly dishTitle: string,
        public readonly isSoftDeleted: boolean
    ) {}

    isSuccess(): boolean {
        return this.isSoftDeleted;
    }

    getTitle(): string {
        return this.dishTitle;
    }

}