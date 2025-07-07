export class MissingDishAssociationForRecipeError extends Error {

    constructor() {
        super('Recipe must be associated with a dish');
    }
}