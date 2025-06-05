export class DishRecipeExistsError extends Error {

    constructor(dishId: string, recipeId: string) {
        super(`Recipe "${recipeId}" already exists for this specific dish "${dishId}"`);
    }
}