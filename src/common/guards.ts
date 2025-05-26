import { DishRepository } from '../mongodb/repositories/dish.repository';

export function isDishRepository(dishRepository: unknown): dishRepository is DishRepository {
    return dishRepository instanceof DishRepository;
}