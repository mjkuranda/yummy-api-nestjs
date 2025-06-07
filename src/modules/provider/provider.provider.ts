import { Provider } from '@nestjs/common';
import { Provider as ProviderEnum, Repository } from '../../common/enums';
import { ProviderMap, RepositoryMap } from '../../common/types';
import { PROVIDERS, REPOSITORIES } from '../../constants/nestjs.contant';
import { DishRepository } from '../../mongodb/repositories/dish.repository';
import { SpoonacularApiService } from '../api/spoonacular/spoonacular.api.service';
import { DishRecipeRepository } from '../../mongodb/repositories/dish-recipe.repository';
import { DishMatcherApiService } from '../../services/dish-matcher-api.service';

export const providerServices: Provider[] = [
    DishRepository,
    DishRecipeRepository,
    DishMatcherApiService,
    SpoonacularApiService,
    {
        provide: PROVIDERS,
        useFactory: (
            dishMatcherApiService: DishMatcherApiService,
            spoonacularApiService: SpoonacularApiService
        ): ProviderMap => ({
            [ProviderEnum.INT_DMT_USER]: dishMatcherApiService,
            [ProviderEnum.EXT_API_SPOONACULAR]: spoonacularApiService
        }),
        inject: [
            DishRepository,
            DishRecipeRepository,
            DishMatcherApiService,
            SpoonacularApiService
        ]
    }
];

export const providerRepositories: Provider[] = [
    DishRepository,
    DishRecipeRepository,
    {
        provide: REPOSITORIES,
        useFactory: (
            dishRepository: DishRepository,
            dishRecipeRepository: DishRecipeRepository
        ): RepositoryMap => ({
            [Repository.DISH_REPOSITORY]: dishRepository,
            [Repository.RECIPE_REPOSITORY]: dishRecipeRepository
        }),
        inject: [
            DishRepository,
            DishRecipeRepository
        ]
    }
];