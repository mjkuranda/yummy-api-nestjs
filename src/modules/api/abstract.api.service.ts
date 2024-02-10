import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { IngredientName, MealType } from '../../common/enums';
import { RatedMeal } from '../meal/meal.types';
import { getQueryWithIngredientsAndMealType } from '../meal/meal.utils';
import axios, { AxiosResponse } from 'axios';
import { ApiName } from '../redis/redis.types';
import { IngredientType } from '../../common/types';

@Injectable()
export abstract class AbstractApiService<GenericMealStruct, GenericIngredientStruct> {

    constructor(
        protected readonly redisService: RedisService
    ) {}

    abstract getApiUrl(): string;

    abstract getName(): ApiName;

    abstract proceedDataToMeals(data: GenericMealStruct[]): RatedMeal[];

    abstract proceedDataMealIngredients(ingredients: GenericIngredientStruct[]): IngredientType[];

    async getMeals(apiKey: string, endpointUrl: string, ingredients: IngredientName[], mealType: MealType): Promise<RatedMeal[]> {
        const query = getQueryWithIngredientsAndMealType(apiKey, ingredients, mealType);
        const cachedResult = await this.redisService.getMealResult(this.getName(), query);

        if (cachedResult) {
            return cachedResult;
        }

        const url = this.getFullApiUrl(endpointUrl, query);
        let result: AxiosResponse<GenericMealStruct[], unknown>;

        try {
            result = await axios.get(url);
        } catch (err: any) {
            console.error('Error occured: ', err.message);
        }

        if (result.status < 200 || result.status >= 300) {
            throw new Error(result.statusText);
        }

        const meals = this.proceedDataToMeals(result.data);
        await this.redisService.saveMealResult(this.getName(), query, meals);

        return meals;
    }

    private getFullApiUrl(endpointUrl: string, query: string) {
        return `${this.getApiUrl()}/${endpointUrl}?${query}`;
    }
}