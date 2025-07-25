export class DishNotFoundError extends Error {

    constructor(encodedDishId: string) {
        super(`Not found dish with ${encodedDishId} id.`);
    }
}