import { DishRepository } from '../mongodb/repositories/dish.repository';

// NOTE: Unused
export function isDishRepository(dishRepository: unknown): dishRepository is DishRepository {
    return dishRepository instanceof DishRepository;
}