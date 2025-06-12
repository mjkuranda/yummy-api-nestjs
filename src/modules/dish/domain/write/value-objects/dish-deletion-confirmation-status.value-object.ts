export class DishDeletionConfirmationStatusValueObject {

    constructor(
        private readonly dishTitle: string,
        private readonly wasDeleted: boolean
    ) {}

    getDishTitle(): string {
        return this.dishTitle;
    }

    wasDishDeleted(): boolean {
        return this.wasDeleted;
    }
}