export class NotDishAuthorError extends Error {

    constructor() {
        super('You must be an author the dish to apply a recipe');
    }
}