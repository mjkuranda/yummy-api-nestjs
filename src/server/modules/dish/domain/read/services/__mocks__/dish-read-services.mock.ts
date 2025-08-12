import { createMock } from '../../../../../../common/__tests__/helpers';
import { ProviderRegistryService } from '../../../../../provider-registry/provider-registry.service';
import { DishCacheService } from '../../../../../cache/domains/dish/dish-cache.service';
import { DishAggregatorService } from '../dish-aggregator.service';
import { Providable } from '../../../../../../common/interfaces';
import { DishDataManageable, UserDataManageable } from '../../../../../provider-registry/data-manageable.interface';

export const mockProvidable = createMock<Providable>({
    getDishes: jest.fn(),
    getDishDetails: jest.fn(),
    getLanguage: jest.fn()
});

export const mockDishApiService = createMock<DishDataManageable>({
    findByDishId: jest.fn(),
    getAllComments: jest.fn(),
    getAverageRatingForDish: jest.fn(),
    getDishesWithSoftAdded: jest.fn(),
    getDishesWithSoftEdited: jest.fn(),
    getDishesWithSoftDeleted: jest.fn()
});

export const mockUserApiService = createMock<UserDataManageable>({
    findAllRecentQueries: jest.fn()
});

export const mockProviderRegistryService = createMock<ProviderRegistryService>({
    getProvider: jest.fn(() => mockProvidable),
    getDishApiService: jest.fn(() => mockDishApiService),
    getUserApiService: jest.fn(() => mockUserApiService),
    getAllProviders: jest.fn(() => [mockProvidable])
});

export const mockDishCacheService = createMock<DishCacheService>({
    getDishes: jest.fn(),
    setDishes: jest.fn(),
    getDishDetails: jest.fn(),
    setDishDetails: jest.fn(),
    hasDish: jest.fn(),
    deleteDish: jest.fn()
});

export const mockDishAggregatorService = createMock<DishAggregatorService>({
    aggregateDishResults: jest.fn()
});