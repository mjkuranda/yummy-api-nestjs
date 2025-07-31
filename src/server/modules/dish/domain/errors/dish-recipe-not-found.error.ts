export class DishRecipeNotFoundError extends Error {

    constructor(encodedDishId: string) {
        super(`Recipe for "${encodedDishId}" dish has not been found`);
    }
}