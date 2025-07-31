import { createMock } from '../../../../../common/__tests__/helpers';
import { DishApiService, RecipeApiService } from '../../../../provider-registry/internal-apis/manageable-api/services';
import { Providable } from '../../../../../common/interfaces';
import { ProviderRegistryService } from '../../../../provider-registry/provider-registry.service';
import { DishRecipeCacheService } from '../../../../cache/domains/dish-recipe/dish-recipe-cache.service';
import { TranslationService } from '../../../../translation/translation.service';

export const mockDishApiService = createMock<DishApiService>({
    findByDishId: jest.fn()
});

export const mockRecipeApiService = createMock<RecipeApiService>({
    findRecipeByDishId: jest.fn(),
    createRecipe: jest.fn()
});

export const mockProvidable = createMock<Providable>({
    getLanguage: jest.fn(),
    getDishRecipe: jest.fn()
});

export const mockProviderRegistryService = createMock<ProviderRegistryService>({
    getDishApiService: jest.fn(() => mockDishApiService),
    getRecipeApiService: jest.fn(() => mockRecipeApiService),
    getProvider: jest.fn(() => mockProvidable)
});

export const mockDishRecipeCacheService = createMock<DishRecipeCacheService>({
    setDishRecipe: jest.fn(),
    getDishRecipe: jest.fn()
});

export const mockTranslationService = createMock<TranslationService>({
    translateRecipe: jest.fn()
});