import { DetailedDish, RatedDish } from '../modules/dish/dish.types';
import { DishRepository } from '../mongodb/repositories/dish.repository';
import { AbstractApiService } from '../services/abstract.api.service';

export interface DishSourceService {
    getDishes: (ingredients: string[]) => RatedDish[];
    getDishDetails: (id: string) => DetailedDish;
}