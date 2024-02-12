import { IngredientName, MealType } from '../../common/enums';
import { ApiName } from '../redis/redis.types';

export function getQueryWithIngredientsAndMealType(ingredients: IngredientName[], type: MealType, apiName?: ApiName, apiKey?: string): string {
    const ingredientList = ingredients.sort().join(',');

    if (!apiName || !apiKey) {
        return `ings=${ingredientList}&type=${type}`;
    }

    switch (apiName) {
    case 'merged':
    case 'localmongo':
        return `ings=${ingredientList}&type=${type}`;
    case 'spoonacular':
        return `apiKey=${apiKey}&ingredients=${ingredientList}&type=${type}`;
    default:
        throw new Error('Unknown API name case.');
    }
}