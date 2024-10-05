import { AbstractApiService } from './abstract.api.service';
import { ApiName } from '../modules/redis/redis.types';
import { DetailedDish, RatedDish } from '../modules/dish/dish.types';
import { IngredientType, DishIngredient } from '../modules/ingredient/ingredient.types';

export class TestApiService extends AbstractApiService<any, any, any, any> {

    getApiUrl(): string {
        return 'api-url';
    }

    getName(): ApiName {
        return undefined;
    }

    proceedDataToIngredientList(ingredients: any[]): IngredientType[] {
        return [...ingredients];
    }

    proceedDataToDishIngredients(ingredients: any[]): DishIngredient[] {
        return [...ingredients];
    }

    proceedDataToDishes(data: any[]): RatedDish[] {
        return [...data];
    }

    proceedDataToDishDetails(data: any, instructionData: any): DetailedDish {
        return { ...data, ...instructionData };
    }

}