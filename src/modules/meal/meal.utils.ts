import { IngredientName, MealType } from '../../common/enums';

export function getQueryWithIngredientsAndMealType(apiKey: string, ingredients: IngredientName[], type: MealType): string {
    const ingredientList = ingredients.sort().join(',');

    if (!apiKey) {
        return `ings=${ingredientList}&type=${type}`;
    }

    return `apiKey=${apiKey}&ings=${ingredientList}&type=${type}`;
}