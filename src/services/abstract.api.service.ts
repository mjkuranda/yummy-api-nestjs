import { Injectable } from '@nestjs/common';
import { RedisService } from '../modules/redis/redis.service';
import { MealType } from '../common/enums';
import { DetailedMeal, RatedMeal } from '../modules/meal/meal.types';
import { getQueryWithIngredientsAndMealType } from '../modules/meal/meal.utils';
import { AxiosResponse } from 'axios';
import { ApiName } from '../modules/redis/redis.types';
import { ContextString } from '../common/types';
import { LoggerService } from '../modules/logger/logger.service';
import { AxiosService } from './axios.service';
import { IngredientType, MealIngredient } from '../modules/ingredient/ingredient.types';

@Injectable()
export abstract class AbstractApiService<GenericMealStruct, GenericIngredientStruct, GenericMealDetailsStruct, MealInstructionStruct> {

    constructor(
        protected readonly axiosService: AxiosService,
        protected readonly redisService: RedisService,
        protected readonly loggerService: LoggerService
    ) {}

    abstract getApiUrl(): string;

    abstract getName(): ApiName;

    abstract proceedDataToMeals(data: GenericMealStruct[]): RatedMeal[];

    abstract proceedDataToMealDetails(data: GenericMealDetailsStruct, instructionData: MealInstructionStruct): DetailedMeal;

    abstract proceedDataToMealIngredients(ingredients: GenericIngredientStruct[]): MealIngredient[];

    abstract proceedDataToIngredientList(ingredients: GenericIngredientStruct[]): IngredientType[];

    async getMeals(apiKey: string, endpointUrl: string, ingredients: IngredientType[], mealType?: MealType): Promise<RatedMeal[]> {
        const query = getQueryWithIngredientsAndMealType(ingredients, mealType, this.getName(), apiKey);
        const cachedResult = await this.redisService.getMealResult(this.getName(), query);
        const context: ContextString = 'AbstractApiService/getMeals';

        if (cachedResult) {
            this.loggerService.info(context, `Found cached query providing ${cachedResult.length} meals.`);

            return cachedResult;
        }

        const url: string = this.getFullApiUrl(endpointUrl, query);

        try {
            const result: AxiosResponse<GenericMealStruct[], unknown> = await this.axiosService.get(url);

            if (result.status < 200 || result.status >= 300) {
                this.loggerService.error(context, `External API returned ${result.status} code with "${result.statusText}" message. Returned 0 meals.`);

                return [];
            }

            const meals: RatedMeal[] = this.proceedDataToMeals(result.data);
            await this.redisService.saveMealResult(this.getName(), query, meals);
            this.loggerService.info(context, `Received ${meals.length} meals. Query "${query}" has been cached from "${this.getName()}" API.`);

            return meals;
        } catch (err: any) {
            this.loggerService.error(context, 'Error occurred during fetching from external API. Received 0 meals.');

            return [];
        }
    }

    async getMealDetails(apiUrl: string, apiInstructionUrl: string): Promise<DetailedMeal> {
        const url: string = this.getFullApiUrl(apiUrl);
        const instructionUrl: string = this.getFullApiUrl(apiInstructionUrl);
        const context = 'AbstractApiService/getMealDetails';

        try {
            const result: AxiosResponse<GenericMealDetailsStruct, unknown> = await this.axiosService.get(url);
            const instruction: AxiosResponse<MealInstructionStruct, unknown> = await this.axiosService.get(instructionUrl);

            if (result.status < 200 || result.status >= 300) {
                this.loggerService.error(context, `External API returned ${result.status} code with "${result.statusText}" message. Returned 0 meals.`);

                return null;
            }

            if (instruction.status < 200 || instruction.status >= 300) {
                this.loggerService.error(context, `External API returned ${instruction.status} code with "${instruction.statusText}" message. Returned 0 meals.`);

                return null;
            }

            const meal: DetailedMeal = this.proceedDataToMealDetails(result.data, instruction.data);
            this.loggerService.info(context, `Received meal with details from "${this.getName()}" API.`);

            return meal;
        } catch (err: any) {
            this.loggerService.error(context, `Error occurred during fetching a meal from ${this.getName()} API: ${err.message}.`);

            return null;
        }
    }

    private getFullApiUrl(endpointUrl: string, query?: string) {
        if (!query) {
            return `${this.getApiUrl()}/${endpointUrl}`;
        }

        return `${this.getApiUrl()}/${endpointUrl}?${query}`;
    }
}