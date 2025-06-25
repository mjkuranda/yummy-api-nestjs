import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { LoggerService } from '../../logger/logger.service';
import { DishCacheService } from '../../cache/domains/dish/dish-cache.service';
import { Providable } from '../../../common/interfaces';
import { EncodedDishIdValueObject } from '../../dish/domain/common/value-objects';
import { DishDetailsValueObject, DishResultValueObject } from '../../dish/domain/read/value-objects';
import { ContextString, Language } from '../../../common/types';
import { RecipeEntity } from '../../recipe/domain/entities';
import { DishType, MealType, Provider } from '../../../common/enums';
import { ExternalApiDataAdaptable, EXTERNAL_API_ADAPTER_TOKEN } from '../../../../integrations/interfaces';
import { AxiosResponse } from 'axios';
import { ExternalApiConstantProvidable } from './external-api.interface';
import { DishId } from '../../dish/dish.types';

@Injectable()
export abstract class ExternalApiService<ExternalApiDishResult, ExternalApiDishDetails, ExternalApiDishInstruction, ExternalApiDishIngredient> implements Providable, ExternalApiConstantProvidable {

    protected constructor(
        @Inject(EXTERNAL_API_ADAPTER_TOKEN)
        protected readonly externalApiAdapter: ExternalApiDataAdaptable<ExternalApiDishResult, ExternalApiDishDetails, ExternalApiDishInstruction, ExternalApiDishIngredient>,
        protected readonly httpService: HttpService,
        protected readonly dishCacheService: DishCacheService,
        protected readonly loggerService: LoggerService
    ) {}

    async getDishDetails(encodedDishId: EncodedDishIdValueObject): Promise<DishDetailsValueObject> {
        const dishId = encodedDishId.getDishId();
        const url = this.getDishDetailsEndpointUrl(dishId);
        const context: ContextString = 'AbstractApiService/getDishDetails';

        try {
            const result = await this.httpService.axiosRef.get(url);

            if (result.status < 200 || result.status >= 300) {
                this.loggerService.error(context, `External API returned ${result.status} code with "${result.statusText}" message. Returned 0 dishes.`);

                return null;
            }

            const dish = this.externalApiAdapter.toDishDetails(result.data);
            this.loggerService.info(context, `Received dish with details from "${this.getExternalApiName()}" API.`);

            return dish;
        } catch (err: any) {
            this.loggerService.error(context, `Error occurred during fetching a dish from ${this.getExternalApiName()} API: ${err.message}.`);

            return null;
        }
    }

    async getDishRecipe(encodedDishId: EncodedDishIdValueObject, language: Language): Promise<RecipeEntity | null> {
        const dishId = encodedDishId.getDishId();
        const instructionUrl = this.getDishInstructionEndpointUrl(dishId);
        const context: ContextString = 'AbstractApiService/getDishRecipe';

        try {
            const result: AxiosResponse<ExternalApiDishInstruction, unknown> = await this.httpService.axiosRef.get(instructionUrl);

            if (result.status < 200 || result.status >= 300) {
                this.loggerService.error(context, `External API returned ${result.status} code with "${result.statusText}" message. Returned 0 dishes.`);

                return null;
            }

            const sections = this.externalApiAdapter.toDishRecipeSections(result.data);
            this.loggerService.info(context, `Received recipe for "${dishId}" dish with details from "${this.getExternalApiName()}" API.`);

            return new RecipeEntity(language, dishId, sections);
        } catch (err: any) {
            this.loggerService.error(context, `Error occurred during fetching a dish from ${this.getExternalApiName()} API: ${err.message}.`);

            return null;
        }
    }

    async getDishes(ingredients: string[], mealType?: MealType): Promise<DishResultValueObject[]> {
        const cachedResult = await this.dishCacheService.getDishes(ingredients); // TODO: Meal type...
        const context: ContextString = 'AbstractApiService/getDishes';

        if (cachedResult) {
            this.loggerService.info(context, `Found cached query providing ${cachedResult.length} dishes.`);

            return cachedResult;
        }

        const url: string = this.getDishesEndpointUrl(ingredients, mealType);

        try {
            const result: AxiosResponse<ExternalApiDishResult[], unknown> = await this.httpService.axiosRef.get(url);

            if (result.status < 200 || result.status >= 300) {
                this.loggerService.error(context, `External API returned ${result.status} code with "${result.statusText}" message. Returned 0 dishes.`);

                return [];
            }

            const dishes: DishResultValueObject[] = this.externalApiAdapter.toDishes(result.data, ingredients);
            await this.dishCacheService.setDishes(ingredients, dishes);
            this.loggerService.info(context, `Received ${dishes.length} dishes. Query has been cached from "${this.getExternalApiName()}" API.`);

            return dishes;
        } catch (err: any) {
            this.loggerService.error(context, 'Error occurred during fetching from external API. Received 0 dishes.');

            return [];
        }
    }

    abstract getLanguage(encodedDishId: EncodedDishIdValueObject): Language;

    abstract getProvider(): Provider;

    abstract getApiKey(): string;

    abstract getApiUrl(): string;

    abstract getDishesEndpointUrl(ingredients: string[], mealType?: MealType, dishType?: DishType): string;

    abstract getDishDetailsEndpointUrl(dishId: DishId): string;

    abstract getDishInstructionEndpointUrl(dishId: DishId): string;

    abstract getExternalApiName(): string;
}