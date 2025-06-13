import { MongooseModelFactory } from '../factories/mongoose-model.factory';
import { DishSchema } from '../../mongodb/schemas/dish.schema';
import { DishCommentSchema } from '../../mongodb/schemas/dish-comment.schema';
import { DishRatingSchema } from '../../mongodb/schemas/dish-rating.schema';
import { DishRecipeSchema } from '../../mongodb/schemas/dish-recipe.schema';
import { UserSchema } from '../../mongodb/schemas/user.schema';
import { UserActionSchema } from '../../mongodb/schemas/user-action.schema';
import { UserSearchQuerySchema } from '../../mongodb/schemas/user-search-query.schema';

export const dishModel = MongooseModelFactory.create('dishes', DishSchema);
export const dishCommentModel = MongooseModelFactory.create('dish_comments', DishCommentSchema);
export const dishRatingModel = MongooseModelFactory.create('dish_ratings', DishRatingSchema);
export const dishRecipeModel = MongooseModelFactory.create('dish_recipes', DishRecipeSchema);
export const userModel = MongooseModelFactory.create('users', UserSchema);
export const userActionModel = MongooseModelFactory.create('user_actions', UserActionSchema);
export const userSearchQueryModel = MongooseModelFactory.create('user_search_queries', UserSearchQuerySchema);