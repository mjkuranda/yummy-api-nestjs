export class DishRecipeExistsError extends Error {

    constructor(encodedDishId: string) {
        super(`Recipe already exists for this specific dish "${encodedDishId}"`);
    }
}