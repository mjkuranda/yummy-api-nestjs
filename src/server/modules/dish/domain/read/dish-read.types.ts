import { DetailedDish, RatedDish } from '../../dish.types';
import { DishDetailsValueObject } from './value-objects';

export interface GetDishDetailsResult {
    dish: DishDetailsValueObject;
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