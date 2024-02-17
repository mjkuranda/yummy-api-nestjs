import { MealType } from '../../common/enums';
import { ApiName } from '../redis/redis.types';
import { IngredientType } from '../ingredient/ingredient.types';
import { MealDocument } from '../../mongodb/documents/meal.document';
import { DetailedMeal, MergedSearchQueries, ProposedMeal, RatedMeal } from './meal.types';
import { SearchQueryDocument } from '../../mongodb/documents/search-query.document';

export function getQueryWithIngredientsAndMealType(ingredients: IngredientType[], type?: MealType, apiName?: ApiName, apiKey?: string): string {
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

export function mergeSearchQueries(searchQueries: SearchQueryDocument[]): MergedSearchQueries {
    const merged: MergedSearchQueries = {};

    for (const query of searchQueries) {
        const { ingredients } = query;

        for (const ingredient of ingredients) {
            if (merged[ingredient]) {
                merged[ingredient]++;
            } else {
                merged[ingredient] = 1;
            }
        }
    }

    return merged;
}

export function proceedRatedMealsToProposedMeals(meals: RatedMeal[], mergedSearchQueries: MergedSearchQueries): ProposedMeal[] {
    return meals.map(meal => {
        const { id, imgUrl, ingredients, title } = meal;
        const recommendationPoints = meal.ingredients.reduce((points, ingredient) => {
            if (!mergedSearchQueries[ingredient]) {
                return points;
            }

            return points + mergedSearchQueries[ingredient];
        }, 0);

        return {
            id,
            imgUrl,
            ingredients,
            recommendationPoints,
            title
        };
    });
}