export class MissingDishAuthorError extends Error {

    constructor() {
        super('Missing author during creating a new dish.');
    }
}