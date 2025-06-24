import { Inject, Injectable } from '@nestjs/common';
import { ExternalApiService } from '../../server/modules/provider-registry/external-apis/external-api.service';
import { DishId } from '../../server/modules/dish/dish.types';
import { DishType, MealType, Provider } from '../../server/common/enums';
import { EncodedDishIdValueObject } from '../../server/modules/dish/domain/common/value-objects';
import { Language } from '../../server/common/types';
import { getCompactUrl } from '../../server/modules/provider-registry/external-apis/external-api.helper';
import {
    SpoonacularIngredient,
    SpoonacularRecipe,
    SpoonacularRecipeDetails,
    SpoonacularRecipeSections
} from './spoonacular-api.types';
import { HttpService } from '@nestjs/axios';
import { DishCacheService } from '../../server/modules/cache/dish/dish-cache.service';
import { LoggerService } from '../../server/modules/logger/logger.service';
import { EXTERNAL_API_ADAPTER_TOKEN, ExternalApiDataAdaptable } from '../interfaces';

@Injectable()
export class SpoonacularApiService extends ExternalApiService<SpoonacularRecipe, SpoonacularRecipeDetails, SpoonacularRecipeSections, SpoonacularIngredient> {

    constructor(
        @Inject(EXTERNAL_API_ADAPTER_TOKEN)
        protected readonly externalApiAdapter: ExternalApiDataAdaptable<SpoonacularRecipe, SpoonacularRecipeDetails, SpoonacularRecipeSections, SpoonacularIngredient>,
        protected readonly httpService: HttpService,
        protected readonly dishCacheService: DishCacheService,
        protected readonly loggerService: LoggerService
    ) {
        super(externalApiAdapter, httpService, dishCacheService, loggerService);
    }

    getApiKey(): string {
        return process.env.SPOONACULAR_API_KEY;
    }

    getApiUrl(): string {
        return 'https://api.spoonacular.com';
    }

    getDishDetailsEndpointUrl(dishId: DishId): string {
        return getCompactUrl({
            apiUrl: this.getApiUrl(),
            endpointUrl: `recipes/${dishId}/information`,
            queryVars: {
                apiKey: this.getApiKey()
            }
        });
    }

    getDishInstructionEndpointUrl(dishId: DishId): string {
        return getCompactUrl({
            apiUrl: this.getApiUrl(),
            endpointUrl: `recipes/${dishId}/analyzedInstructions`,
            queryVars: {
                apiKey: this.getApiKey()
            }
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getDishesEndpointUrl(ingredients: string[], mealType?: MealType, dishType?: DishType): string {
        return getCompactUrl({
            apiUrl: this.getApiUrl(),
            endpointUrl: 'recipes/findByIngredients',
            queryVars: {
                apiKey: this.getApiKey(),
                ingredients: ingredients.join(',')
            }
        });
    }

    getExternalApiName(): string {
        return 'Spoonacular API';
    }

    // TODO: Getting dish and returning its language
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getLanguage(encodedDishId: EncodedDishIdValueObject): Language {
        return 'en';
    }

    getProvider(): Provider {
        return Provider.EXT_API_SPOONACULAR;
    }
}