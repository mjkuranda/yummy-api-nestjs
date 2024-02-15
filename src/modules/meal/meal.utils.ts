import { IngredientName, MealType } from '../../common/enums';
import { ApiName } from '../redis/redis.types';

export function getQueryWithIngredientsAndMealType(ingredients: IngredientName[], type: MealType, apiName?: ApiName, apiKey?: string): string {
    const ingredientList = ingredients.sort().join(',');
    const mealType = type ?? `type=${type}`;

    if (!apiName || !apiKey) {
        return `ings=${ingredientList}${mealType ?? `&${mealType}`}`;
    }

    switch (apiName) {
    case 'merged':
    case 'localmongo':
        return `ings=${ingredientList}${mealType ?? `&${mealType}`}`;
    case 'spoonacular':
        return `apiKey=${apiKey}&ingredients=${ingredientList}${mealType ?? `&${mealType}`}`;
    default:
        throw new Error('Unknown API name case.');
    }
}