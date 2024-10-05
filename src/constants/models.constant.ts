import { UserSchema } from '../mongodb/schemas/user.schema';
import { UserActionSchema } from '../mongodb/schemas/user-action.schema';
import { DishSchema } from '../mongodb/schemas/dish.schema';
import { SearchQuerySchema } from '../mongodb/schemas/search-query.schema';
import { DishCommentSchema } from '../mongodb/schemas/dish-comment.schema';
import { DishRatingSchema } from '../mongodb/schemas/dish-rating.schema';

export const models = {
    DISH_MODEL: 'DISH_MODEL',
    DISH_COMMENT_MODEL: 'DISH_COMMENT_MODEL',
    DISH_RATING_MODEL: 'DISH_RATING_MODEL',
    SEARCH_QUERY_MODEL: 'SEARCH_QUERY_MODEL',
    USER_MODEL: 'USER_MODEL',
    USER_ACTION_MODEL: 'USER_ACTION_MODEL'
};

export const USER_MODEL = { name: models.USER_MODEL, schema: UserSchema };
export const SEARCH_QUERY_MODEL = { name: models.SEARCH_QUERY_MODEL, schema: SearchQuerySchema };
export const USER_ACTION_MODEL = { name: models.USER_ACTION_MODEL, schema: UserActionSchema };
export const DISH_MODEL = { name: models.DISH_MODEL, schema: DishSchema };
export const DISH_COMMENT_MODEL = { name: models.DISH_COMMENT_MODEL, schema: DishCommentSchema };
export const DISH_RATING_MODEL = { name: models.DISH_RATING_MODEL, schema: DishRatingSchema };