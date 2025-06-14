import { Provider } from '@nestjs/common';
import { Provider as ProviderEnum, Repository } from '../../common/enums';
import { ProviderMap, RepositoryMap } from '../../common/types';
import { PROVIDERS, REPOSITORIES } from '../../constants/nestjs.contant';
import { SpoonacularApiService } from '../api/spoonacular/spoonacular.api.service';
import { DishMatcherApiService } from '../../services/dish-matcher-api.service';
import {
    MongodbRecipeRepository
} from '../recipe/infrastructure/repositories/mongodb.recipe.repository';
import {
    MongodbDishCommentRepository,
    MongodbDishRatingRepository,
    MongodbDishRepository, MongodbUserSearchQueryRepository
} from '../dish/infrastructure/repositories';
import { MongodbUserActionRepository } from '../user/infrastructure/repositories/mongodb.user-action.repository';
import { MongodbUserRepository } from '../user/infrastructure/repositories/mongodb.user.repository';

export const providerServices: Provider[] = [
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
            DishMatcherApiService,
            SpoonacularApiService
        ]
    }
];

export const providerRepositories: Provider[] = [
    MongodbDishRepository,
    MongodbDishCommentRepository,
    MongodbDishRatingRepository,
    MongodbRecipeRepository,
    MongodbUserRepository,
    MongodbUserActionRepository,
    MongodbUserSearchQueryRepository,
    {
        provide: REPOSITORIES,
        useFactory: (
            dishRepository: MongodbDishRepository,
            dishCommentRepository: MongodbDishCommentRepository,
            dishRatingRepository: MongodbDishRatingRepository,
            recipeRepository: MongodbRecipeRepository,
            userRepository: MongodbUserRepository,
            userActionRepository: MongodbUserActionRepository,
            userSearchQueryRepository: MongodbUserSearchQueryRepository
        ): RepositoryMap => ({
            [Repository.DISH_REPOSITORY]: dishRepository,
            [Repository.DISH_COMMENT_REPOSITORY]: dishCommentRepository,
            [Repository.DISH_RATING_REPOSITORY]: dishRatingRepository,
            [Repository.RECIPE_REPOSITORY]: recipeRepository,
            [Repository.USER_REPOSITORY]: userRepository,
            [Repository.USER_ACTION_REPOSITORY]: userActionRepository,
            [Repository.USER_SEARCH_QUERY_REPOSITORY]: userSearchQueryRepository
        }),
        inject: [
            MongodbDishRepository,
            MongodbDishCommentRepository,
            MongodbDishRatingRepository,
            MongodbRecipeRepository,
            MongodbUserRepository,
            MongodbUserActionRepository,
            MongodbUserSearchQueryRepository
        ]
    }
];