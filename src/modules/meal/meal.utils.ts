import { IngredientName, MealType } from '../../common/enums';

export function getQueryWithIngredientsAndMealType(apiKey: string, ingredients: IngredientName[], type: MealType): string {
    const ingredientList = ingredients.sort().join(',');

    return `apiKey=${apiKey}&ings=${ingredientList}&type=${type}`;
}