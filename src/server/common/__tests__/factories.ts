import { DishEntityProps } from '../../modules/dish/domain/common/types';
import { DishEntity } from '../../modules/dish/domain/common/entities';
import { DishType, MealType, Provider } from '../enums';

export function makeDishEntity(overrides: Partial<DishEntityProps> = {}): DishEntity {
    return new DishEntity(
        {
            id: 'dish-id',
            title: 'original title',
            description: 'original description',
            author: 'author',
            softAdded: false,
            softEdited: null,
            softDeleted: false,
            imageUrl: 'https://host/id',
            dishType: DishType.ANY,
            mealType: MealType.ANY,
            ingredients: [],
            language: 'en',
            readyInMinutes: 10,
            provider: Provider.INT_DMT_USER,
            posted: Date.now(),
            ...overrides
        }
    );
}

export function makeSoftDeletedDishEntity(overrides: Partial<DishEntityProps> = {}): DishEntity {
    return makeDishEntity({
        ...overrides,
        softDeleted: true
    });
}
