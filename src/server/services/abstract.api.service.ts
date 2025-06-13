import { Injectable } from '@nestjs/common';
import { Provider, MealType } from '../common/enums';
import { DishId, DishRecipeSections } from '../modules/dish/dish.types';
import { getQueryWithIngredientsAndDishType } from '../modules/dish/dish.utils';
import { AxiosResponse } from 'axios';
import { ApiName } from '../modules/redis/redis.types';
import { ContextString, Language } from '../common/types';
import { LoggerService } from '../modules/logger/logger.service';
import { AxiosService } from './axios.service';
import { IngredientType, DishIngredient } from '../modules/ingredient/ingredient.types';
import { Providable } from '../common/interfaces';
import { RecipeEntity } from '../modules/recipe/domain/entities';
import { DishDetailsValueObject, DishResultValueObject } from '../modules/dish/domain/read/value-objects';
import { EncodedDishIdValueObject } from '../modules/dish/domain/common/value-objects';
import { DishCacheService } from '../modules/cache/dish/dish-cache.service';

@Injectable()
export abstract class AbstractApiService<GenericDishStruct, GenericIngredientStruct, GenericDishDetailsStruct, DishInstructionStruct> implements Providable {

    constructor(
        protected readonly axiosService: AxiosService,
        protected readonly dishCacheService: DishCacheService,
        protected readonly loggerService: LoggerService
    ) {}

    abstract getApiUrl(): string;

    abstract getApiKey(): string;

    abstract getDishesEndpointUrl(): string;

    abstract getDishDetailsEndpointUrl(dishId: DishId): string;

    abstract getDishInstructionEndpointUrl(id: string): string;

    abstract getName(): ApiName;

    abstract proceedDataToDishes(data: GenericDishStruct[], providedIngredients?: IngredientType[]): DishResultValueObject[];

    abstract proceedDataToDishDetails(data: GenericDishDetailsStruct): DishDetailsValueObject;

    abstract proceedDataToDishRecipeSections(instructionData: DishInstructionStruct): DishRecipeSections;

    abstract proceedDataToDishIngredients(ingredients: GenericIngredientStruct[]): DishIngredient[];

    abstract proceedDataToIngredientList(ingredients: GenericIngredientStruct[]): IngredientType[];

    abstract getProvider(): Provider;

    async getDishes(ingredients: IngredientType[], mealType?: MealType): Promise<DishResultValueObject[]> {
        const query = getQueryWithIngredientsAndDishType(ingredients, mealType, this.getName(), this.getApiKey());
        // const cachedResult = await this.redisService.getDishResult(this.getName(), query);
        const cachedResult = await this.dishCacheService.getDishes(ingredients); // TODO: Meal type...
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

            const dishes: DishResultValueObject[] = this.proceedDataToDishes(result.data, ingredients);
            // await this.redisService.saveDishResult(this.getName(), query, dishes);
            await this.dishCacheService.setDishes(ingredients, dishes);
            this.loggerService.info(context, `Received ${dishes.length} dishes. Query "${query}" has been cached from "${this.getName()}" API.`);

            return dishes;
        } catch (err: any) {
            this.loggerService.error(context, 'Error occurred during fetching from external API. Received 0 dishes.');

            return [];
        }
    }

    async getDishDetails(encodedDishId: EncodedDishIdValueObject): Promise<DishDetailsValueObject> {
        const dishId = encodedDishId.getDishId();
        const endpointUrl = this.getDishDetailsEndpointUrl(dishId);
        const url: string = this.getFullApiUrl(endpointUrl);
        const context = 'AbstractApiService/getDishDetails';

        try {
            const result: AxiosResponse<GenericDishDetailsStruct, unknown> = await this.axiosService.get(url);

            if (result.status < 200 || result.status >= 300) {
                this.loggerService.error(context, `External API returned ${result.status} code with "${result.statusText}" message. Returned 0 dishes.`);

                return null;
            }

            const dish = this.proceedDataToDishDetails(result.data);
            this.loggerService.info(context, `Received dish with details from "${this.getName()}" API.`);

            return dish;
        } catch (err: any) {
            this.loggerService.error(context, `Error occurred during fetching a dish from ${this.getName()} API: ${err.message}.`);

            return null;
        }
    }

    async getDishRecipe(encodedDishId: EncodedDishIdValueObject, language: Language): Promise<RecipeEntity | null> {
        const dishId = encodedDishId.getDishId();
        const instructionUrl: string = this.getFullApiUrl(this.getDishInstructionEndpointUrl(<string>dishId));
        const context = 'AbstractApiService/getDishRecipe';

        try {
            const result: AxiosResponse<DishInstructionStruct, unknown> = await this.axiosService.get(instructionUrl);

            if (result.status < 200 || result.status >= 300) {
                this.loggerService.error(context, `External API returned ${result.status} code with "${result.statusText}" message. Returned 0 dishes.`);

                return null;
            }

            const sections: DishRecipeSections = this.proceedDataToDishRecipeSections(result.data);
            this.loggerService.info(context, `Received recipe for "${dishId}" dish with details from "${this.getName()}" API.`);

            return new RecipeEntity(language, dishId, sections);
        } catch (err: any) {
            this.loggerService.error(context, `Error occurred during fetching a dish from ${this.getName()} API: ${err.message}.`);

            return null;
        }
    }

    abstract getLanguage(encodedDishId: EncodedDishIdValueObject): Language;

    private getFullApiUrl(endpointUrl: string, query?: string) {
        if (!query) {
            return `${this.getApiUrl()}/${endpointUrl}`;
        }

        return `${this.getApiUrl()}/${endpointUrl}?${query}`;
    }
}