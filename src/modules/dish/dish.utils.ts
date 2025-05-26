import { DishProvider, MealType } from '../../common/enums';
import { ApiName } from '../redis/redis.types';
import { IngredientType } from '../ingredient/ingredient.types';
import { DishDocument } from '../../mongodb/documents/dish.document';
import { DetailedDish, MergedSearchQueries, ProposedDish, RatedDish } from './dish.types';
import { UserSearchQueryDocument } from '../../mongodb/documents/user-search-query.document';

// FIXME: Do to deprecate
export function getQueryWithIngredientsAndDishType(ingredients: IngredientType[], type?: MealType, apiName?: ApiName, apiKey?: string): string {
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
        return `apiKey=${apiKey}&ignorePantry=false&ingredients=${ingredientList}${mealType ?? `&${mealType}`}`;
    default:
        throw new Error('Unknown API name case.');
    }
}

export function proceedDishDocumentToDishDetails(dish: DishDocument): DetailedDish {
    const {
        imageUrl, ingredients, language, title, description,
        author, readyInMinutes, type, mealType
    } = dish;

    return {
        imgUrl: imageUrl,
        ingredients: ingredients.map(ingredient => ({
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
            imageUrl: ingredient.imageUrl ? `https://img.spoonacular.com/ingredients_250x250/${ingredient.imageUrl}` : ''
        })),
        language,
        title,
        description,
        sourceOrAuthor: author,
        provider: DishProvider.INT_DMT_USER,
        readyInMinutes,
        type,
        mealType
    };
}

export function mergeSearchQueries(searchQueries: UserSearchQueryDocument[]): MergedSearchQueries {
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

export function proceedRatedDishesToProposedDishes(dishes: RatedDish[], mergedSearchQueries: MergedSearchQueries): ProposedDish[] {
    return dishes.map(dish => {
        const { encodedDishId, imgUrl, ingredients, title, provider, type, mealType } = dish;
        const recommendationPoints = dish.ingredients.reduce((points, ingredient) => {
            if (!mergedSearchQueries[ingredient]) {
                return points;
            }

            return points + mergedSearchQueries[ingredient];
        }, 0);

        return {
            encodedDishId,
            ...(imgUrl && { imgUrl }),
            ingredients,
            recommendationPoints,
            title,
            provider,
            type,
            mealType
        };
    });
}