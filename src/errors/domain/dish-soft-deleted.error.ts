export class DishSoftDeletedError extends Error {

    constructor(id: string) {
        super(`Dish with "${id}" id is labeled to be deleted. Therefore, it is impossible to see its content.`);
    }
}