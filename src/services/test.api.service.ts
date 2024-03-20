import { AbstractApiService } from './abstract.api.service';
import { ApiName } from '../modules/redis/redis.types';
import { DetailedMeal, RatedMeal } from '../modules/meal/meal.types';
import { IngredientType, MealIngredient } from '../modules/ingredient/ingredient.types';

export class TestApiService extends AbstractApiService<any, any, any> {

    getApiUrl(): string {
        return 'api-url';
    }

    getName(): ApiName {
        return undefined;
    }

    proceedDataToIngredientList(ingredients: any[]): IngredientType[] {
        return [...ingredients];
    }

    proceedDataToMealIngredients(ingredients: any[]): MealIngredient[] {
        return [...ingredients];
    }

    proceedDataToMeals(data: any[]): RatedMeal[] {
        return [...data];
    }

    proceedDataToMealDetails(data: any): DetailedMeal {
        return { ...data };
    }

}