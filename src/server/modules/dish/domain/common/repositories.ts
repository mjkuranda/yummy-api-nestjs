import { DishCommentEntity, DishRatingEntity, UserSearchQueryEntity } from './entities';
import { DishId } from '../../dish.types';

export interface UserSearchQueryRepository {
    insertNewQuery: (userLogin: string, ingredients: string[]) => Promise<void>;
    findAllRecentQueries: (userLogin: string) => Promise<UserSearchQueryEntity[]>;
}

export interface DishCommentRepository {
    postNewComment: (userLogin: string, text: string, dishId: DishId) => Promise<void>;
    getAllComments: (dishId: DishId, limit?: number) => Promise<DishCommentEntity[]>;
    deleteAllComments: (dishId: DishId) => Promise<void>;
}

export interface DishRatingRepository {
    findRating: (userLogin: string, dishId: DishId) => Promise<DishRatingEntity | null>;
    insertNewRating: (userLogin: string, dishId: DishId, rating: number) => Promise<void>;
    updateRating: (userLogin: string, dishId: DishId, newRating: number) => Promise<void>;
    deleteAllRatings: (dishId: DishId) => Promise<void>;
    getAverageRatingForDish: (dishId: DishId) => Promise<DishRatingEntity>;
}