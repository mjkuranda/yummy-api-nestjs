import { MealType } from '../../common/enums';
import { ApiName } from '../redis/redis.types';
import { IngredientType } from '../ingredient/ingredient.types';
import { MealDocument } from '../../mongodb/documents/meal.document';
import { DetailedMeal } from './meal.types';

export function getQueryWithIngredientsAndMealType(ingredients: IngredientType[], type: MealType, apiName?: ApiName, apiKey?: string): string {
    const ingredientList = ingredients.sort().join(',');
    const mealType = type ? `type=${type}` : '';

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

export function proceedMealDocumentToMealDetails(meal: MealDocument): DetailedMeal {
    const { id, imageUrl, ingredients, title } = meal;

    return {
        id,
        imgUrl: imageUrl,
        ingredients,
        title
    };
}