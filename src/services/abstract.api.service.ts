import { Injectable } from '@nestjs/common';
import { RedisService } from '../modules/redis/redis.service';
import { MealType } from '../common/enums';
import { DetailedDish, RatedDish } from '../modules/dish/dish.types';
import { getQueryWithIngredientsAndDishType } from '../modules/dish/dish.utils';
import { AxiosResponse } from 'axios';
import { ApiName } from '../modules/redis/redis.types';
import { ContextString } from '../common/types';
import { LoggerService } from '../modules/logger/logger.service';
import { AxiosService } from './axios.service';
import { IngredientType, DishIngredient } from '../modules/ingredient/ingredient.types';

@Injectable()
export abstract class AbstractApiService<GenericDishStruct, GenericIngredientStruct, GenericDishDetailsStruct, DishInstructionStruct> {

    constructor(
        protected readonly axiosService: AxiosService,
        protected readonly redisService: RedisService,
        protected readonly loggerService: LoggerService
    ) {}

    abstract getApiUrl(): string;

    abstract getApiKey(): string;

    abstract getDishesEndpointUrl(): string;

    abstract getDishDetailsEndpointUrl(id: string): string;

    abstract getDishInstructionEndpointUrl(id: string): string;

    abstract getName(): ApiName;

    abstract proceedDataToDishes(data: GenericDishStruct[], providedIngredients?: IngredientType[]): RatedDish[];

    abstract proceedDataToDishDetails(data: GenericDishDetailsStruct, instructionData: DishInstructionStruct): DetailedDish;

    abstract proceedDataToDishIngredients(ingredients: GenericIngredientStruct[]): DishIngredient[];

    abstract proceedDataToIngredientList(ingredients: GenericIngredientStruct[]): IngredientType[];

    async getDishes(ingredients: IngredientType[], mealType?: MealType): Promise<RatedDish[]> {
        const query = getQueryWithIngredientsAndDishType(ingredients, mealType, this.getName(), this.getApiKey());
        const cachedResult = await this.redisService.getDishResult(this.getName(), query);
        const context: ContextString = 'AbstractApiService/getDishes';

        if (cachedResult) {
            this.loggerService.info(context, `Found cached query providing ${cachedResult.length} dishes.`);

            return cachedResult;
        }

        const url: string = this.getFullApiUrl(this.getDishesEndpointUrl(), query);

        try {
            const result: AxiosResponse<GenericDishStruct[], unknown> = await this.axiosService.get(url);

            if (result.status < 200 || result.status >= 300) {
                this.loggerService.error(context, `External API returned ${result.status} code with "${result.statusText}" message. Returned 0 dishes.`);

                return [];
            }

            const dishes: RatedDish[] = this.proceedDataToDishes(result.data, ingredients);
            await this.redisService.saveDishResult(this.getName(), query, dishes);
            this.loggerService.info(context, `Received ${dishes.length} dishes. Query "${query}" has been cached from "${this.getName()}" API.`);

            return dishes;
        } catch (err: any) {
            this.loggerService.error(context, 'Error occurred during fetching from external API. Received 0 dishes.');

            return [];
        }
    }

    async getDishDetails(id: string): Promise<DetailedDish> {
        const url: string = this.getFullApiUrl(this.getDishDetailsEndpointUrl(id));
        const instructionUrl: string = this.getFullApiUrl(this.getDishInstructionEndpointUrl(id));
        const context = 'AbstractApiService/getDishDetails';

        try {
            const result: AxiosResponse<GenericDishDetailsStruct, unknown> = await this.axiosService.get(url);
            const instruction: AxiosResponse<DishInstructionStruct, unknown> = await this.axiosService.get(instructionUrl);

            if (result.status < 200 || result.status >= 300) {
                this.loggerService.error(context, `External API returned ${result.status} code with "${result.statusText}" message. Returned 0 dishes.`);

                return null;
            }

            if (instruction.status < 200 || instruction.status >= 300) {
                this.loggerService.error(context, `External API returned ${instruction.status} code with "${instruction.statusText}" message. Returned 0 dishes.`);

                return null;
            }

            const dish: DetailedDish = this.proceedDataToDishDetails(result.data, instruction.data);
            this.loggerService.info(context, `Received dish with details from "${this.getName()}" API.`);

            return dish;
        } catch (err: any) {
            this.loggerService.error(context, `Error occurred during fetching a dish from ${this.getName()} API: ${err.message}.`);

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