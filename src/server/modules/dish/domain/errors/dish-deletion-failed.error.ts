export class DishDeletionFailedError extends Error {

    constructor(encodedDishId: string) {
        super(`Failed to mark dish "${encodedDishId}" as a soft-deleted.`);
    }

}