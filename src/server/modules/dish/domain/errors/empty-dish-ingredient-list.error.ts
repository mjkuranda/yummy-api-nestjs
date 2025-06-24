export class EmptyDishIngredientListError extends Error {

    constructor() {
        super('Cannot create dish without ingredients');
    }
}