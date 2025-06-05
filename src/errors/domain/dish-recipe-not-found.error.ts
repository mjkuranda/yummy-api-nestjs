export class DishRecipeNotFoundError extends Error {

    constructor(dishId: string) {
        super(`Recipe for "${dishId}" dish has not been found`);
    }
}