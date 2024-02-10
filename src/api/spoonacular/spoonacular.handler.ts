import { SpoonacularRecipe } from './spoonacular.api.types';
import { IngredientName, MealType } from '../../common/enums';
import axios from 'axios';
import { getQueryWithIngredientsAndMealType } from '../../modules/meal/meal.utils';

export class SpoonacularApiHandler {

    public readonly name = 'spoonacular';

    private readonly API_URL = 'https://api.spoonacular.com';

    private readonly API_ENDPOINTS = {
        RECIPE_FIND_BY_INGREDIENTS: 'recipes/findByIngredients'
    };

    private getFullApiUrl(endpointUrl: string, query: string) {
        return `${this.API_URL}/${endpointUrl}?${query}`;
    }

    async getMeals(ingredients: IngredientName[], mealType: MealType): Promise<SpoonacularRecipe[]> {
        const query = getQueryWithIngredientsAndMealType(ingredients, mealType);
        const url = this.getFullApiUrl(this.API_ENDPOINTS.RECIPE_FIND_BY_INGREDIENTS, query);
        const result = await axios.get(url);

        if (result.status < 200 || result.status >= 300) {
            throw new Error(result.statusText);
        }

        return result.data;
    }
}