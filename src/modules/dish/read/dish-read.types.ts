import { DetailedDish, RatedDish } from '../dish.types';

export interface GetDishDetailsResult {
    dish: DetailedDish;
    fromCache: boolean;
}

export interface DishDetailsWithMetadata {
    dishDetails: DetailedDish;
    metadata: {
        softAdded?: boolean;
        softDeleted?: boolean;
    }
}

export interface GetDishesResult {
    dishes: RatedDish[];
    fromCache: boolean;
}