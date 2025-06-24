import { Provider } from '@nestjs/common';
import {
    SPOONACULAR_API_ADAPTER_TOKEN,
    SpoonacularApiAdapter
} from '../../../../../integrations/spoonacular-api/spoonacular-api.adapter';
import { SpoonacularApiService } from '../../../../../integrations/spoonacular-api/spoonacular-api.service';
import { EXTERNAL_API_ADAPTER_TOKEN, ExternalApiDataAdaptable } from '../../../../../integrations/interfaces';
import {
    SpoonacularIngredient,
    SpoonacularRecipe,
    SpoonacularRecipeDetails, SpoonacularRecipeSections
} from '../../../../../integrations/spoonacular-api/spoonacular-api.types';
import { HttpService } from '@nestjs/axios';
import { DishCacheService } from '../../../cache/dish/dish-cache.service';
import { LoggerService } from '../../../logger/logger.service';

export const spoonacularApiProviders: Provider[] = [
    {
        provide: EXTERNAL_API_ADAPTER_TOKEN,
        useClass: SpoonacularApiAdapter
    },
    {
        provide: SpoonacularApiService,
        useClass: SpoonacularApiService,
        useFactory: (
            adapter: ExternalApiDataAdaptable<SpoonacularRecipe, SpoonacularRecipeDetails, SpoonacularRecipeSections, SpoonacularIngredient>,
            httpService: HttpService,
            dishCacheService: DishCacheService,
            loggerService: LoggerService,
        ) => new SpoonacularApiService(adapter, httpService, dishCacheService, loggerService),
        inject: [
            SPOONACULAR_API_ADAPTER_TOKEN,
            HttpService,
            DishCacheService,
            LoggerService,
        ],
    }
];