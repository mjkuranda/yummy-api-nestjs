import { UserActionRepository, UserRepository } from '../user/domain/repositories';
import { DishRepository } from '../dish/domain/dish.repository';
import {
    DishCommentRepository,
    DishRatingRepository,
    UserSearchQueryRepository
} from '../dish/domain/common/repositories';
import { RecipeRepository } from '../recipe/domain/recipe.repository';

/**
 * @description Provides an interface that manages all dish data
 */
export interface DishDataManageable
    extends
        DishRepository,
        DishRatingRepository,
        DishCommentRepository
{}

/**
 * @description Provides an interface that manage all recipe data
 */
export interface RecipeDataManageable
    extends
        RecipeRepository
{}

/**
 * @description Provides an interface that manage all user data
 */
export interface UserDataManageable
    extends
        UserRepository,
        UserActionRepository,
        UserSearchQueryRepository
{}