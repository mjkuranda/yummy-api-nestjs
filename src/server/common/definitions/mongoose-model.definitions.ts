import { MongooseModelFactory } from '../factories/mongoose-model.factory';
import {
    DishCommentSchema,
    DishRatingSchema,
    DishRecipeSchema,
    DishSchema, UserActionSchema, UserSchema, UserSearchQuerySchema
} from '../../../infrastructure/databases/mongodb/schemas';

export const dishModel = MongooseModelFactory.create('dishes', DishSchema);
export const dishCommentModel = MongooseModelFactory.create('dish_comments', DishCommentSchema);
export const dishRatingModel = MongooseModelFactory.create('dish_ratings', DishRatingSchema);
export const dishRecipeModel = MongooseModelFactory.create('dish_recipes', DishRecipeSchema);
export const userModel = MongooseModelFactory.create('users', UserSchema);
export const userActionModel = MongooseModelFactory.create('user_actions', UserActionSchema);
export const userSearchQueryModel = MongooseModelFactory.create('user_search_queries', UserSearchQuerySchema);