export class DishSoftDeletedError extends Error {

    constructor(encodedDishId: string) {
        super(`Dish with id "${encodedDishId}" id is labeled to be deleted. Therefore, it is impossible to see its content.`);
    }
}