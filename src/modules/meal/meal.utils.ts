import { IngredientName, MealType } from '../../common/enums';

export function getQueryWithIngredientsAndMealType(ingredients: IngredientName[], type: MealType): string {
    const ingredientList = ingredients.join(',');

    return `ings=${ingredientList}&type=${type}`;
}