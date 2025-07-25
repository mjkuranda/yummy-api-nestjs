export class DishNotAcceptedError extends Error {

    constructor(encodedDishId: string) {
        super(`Dish with id "${encodedDishId}" id was not confirmed by admin. Therefore, it is impossible to see its content.`);
    }
}