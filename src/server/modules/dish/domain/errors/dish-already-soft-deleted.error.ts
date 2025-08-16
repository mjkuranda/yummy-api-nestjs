export class DishAlreadySoftDeletedError extends Error {

    constructor(encodedDishId: string) {
        super(`Dish with ${encodedDishId} id has been previously soft deleted.`);
    }
}