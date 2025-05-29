export class DishNotAcceptedError extends Error {

    constructor(id: string) {
        super(`Dish with "${id}" id was not confirmed by admin. Therefore, it is impossible to see its content.`);
    }
}