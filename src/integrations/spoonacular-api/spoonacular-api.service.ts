import { Inject, Injectable } from '@nestjs/common';
import { ExternalApiService } from '../../server/modules/external-api/external-api.service';
import { DishId } from '../../server/modules/dish/dish.types';
import { DishType, MealType, Provider } from '../../server/common/enums';
import { EncodedDishIdValueObject } from '../../server/modules/dish/domain/common/value-objects';
import { Language } from '../../server/common/types';
import { getCompactUrl } from '../../server/modules/external-api/external-api.helper';
import {
    SpoonacularIngredient,
    SpoonacularRecipe,
    SpoonacularRecipeDetails,
    SpoonacularRecipeSections
} from './spoonacular-api.types';
import { HttpService } from '@nestjs/axios';
import { DishCacheService } from '../../server/modules/cache/dish/dish-cache.service';
import { LoggerService } from '../../server/modules/logger/logger.service';
import { EXTERNAL_API_DATA_ADAPTABLE_TOKEN } from '../interfaces/external-api-data.adaptable';
import { SpoonacularApiAdapter } from './spoonacular-api.adapter';

@Injectable()
export class SpoonacularApiService extends ExternalApiService<SpoonacularRecipe, SpoonacularRecipeDetails, SpoonacularRecipeSections, SpoonacularIngredient> {

    constructor(
        protected readonly httpService: HttpService,
        protected readonly dishCacheService: DishCacheService,
        protected readonly loggerService: LoggerService,
        @Inject(EXTERNAL_API_DATA_ADAPTABLE_TOKEN)
        protected readonly externalApiAdapter: SpoonacularApiAdapter
    ) {
        super(httpService, dishCacheService, loggerService, externalApiAdapter);
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