import { Provider } from '@nestjs/common';
import {
    MongodbDishCommentRepository,
    MongodbDishRatingRepository,
    MongodbDishRepository, MongodbUserSearchQueryRepository
} from '../../dish/infrastructure/repositories';
import { MongodbRecipeRepository } from '../../recipe/infrastructure/repositories/mongodb.recipe.repository';
import { MongodbUserRepository } from '../../user/infrastructure/repositories/mongodb.user.repository';
import { MongodbUserActionRepository } from '../../user/infrastructure/repositories/mongodb.user-action.repository';
import { REPOSITORIES_TOKEN } from '../../../constants/nestjs.contant';
import { DishRepository } from '../../dish/domain/dish.repository';
import {
    DishCommentRepository,
    DishRatingRepository,
    UserSearchQueryRepository
} from '../../dish/domain/common/repositories';
import { RecipeRepository } from '../../recipe/domain/recipe.repository';
import { UserActionRepository, UserRepository } from '../../user/domain/repositories';
import { RepositoryMap } from '../../../common/types';
import { Repository } from '../../../common/enums';

export const REPOSITORIES_PROVIDERS: Provider[] = [
    MongodbDishRepository,
    MongodbDishCommentRepository,
    MongodbDishRatingRepository,
    MongodbRecipeRepository,
    MongodbUserRepository,
    MongodbUserActionRepository,
    MongodbUserSearchQueryRepository,
    {
        provide: REPOSITORIES_TOKEN,
        useFactory: (
            dishRepository: DishRepository,
            dishCommentRepository: DishCommentRepository,
            dishRatingRepository: DishRatingRepository,
            recipeRepository: RecipeRepository,
            userRepository: UserRepository,
            userActionRepository: UserActionRepository,
            userSearchQueryRepository: UserSearchQueryRepository
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