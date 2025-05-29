export class DishNotFoundError extends Error {

    constructor(id: string) {
        super(`Not found dish with ${id} id.`);
    }
}