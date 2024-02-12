import { AbstractApiService } from './abstract.api.service';
import { ApiName } from '../modules/redis/redis.types';
import { IngredientType } from '../common/types';
import { RatedMeal } from '../modules/meal/meal.types';

export class TestApiService extends AbstractApiService<any, any> {

    getApiUrl(): string {
        return 'api-url';
    }

    getName(): ApiName {
        return undefined;
    }

    proceedDataMealIngredients(ingredients: any[]): IngredientType[] {
        return [...ingredients];
    }

    proceedDataToMeals(data: any[]): RatedMeal[] {
        return [...data];
    }

}