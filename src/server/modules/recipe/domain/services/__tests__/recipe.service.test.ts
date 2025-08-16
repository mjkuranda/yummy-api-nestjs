import { RecipeService } from '../recipe.service';
import { ProviderRegistryService } from '../../../../provider-registry/provider-registry.service';
import { TranslationService } from '../../../../translation/translation.service';
import {
    DishNotFoundError,
    NotDishAuthorError,
    DishRecipeExistsError,
    DishRecipeNotFoundError
} from '../../../../dish/domain/errors';
import { DishApiService, RecipeApiService } from '../../../../provider-registry/internal-apis/manageable-api/services';
import {
    mockDishApiService,
    mockDishRecipeCacheService, mockProvidable,
    mockProviderRegistryService,
    mockTranslationService
} from '../__mocks__/recipe-services.mock';
import {
    anotherUserFixture, authorUserFixture, cachedRecipeEntityFixture,
    createRecipeDtoFixture,
    dishEntityWithAuthorFixture,
    encodedDishIdVoFixture, recipeEntityFixture, translatedRecipeEntityFixture,
    userFixture
} from '../__fixtures__/recipe.fixtures';
import { Test } from '@nestjs/testing';

describe('RecipeService', () => {
    let service: RecipeService;
    let providerRegistryService: jest.Mocked<ProviderRegistryService>;
    let translationService: jest.Mocked<TranslationService>;
    let dishApiService: jest.Mocked<DishApiService>;
    let recipeApiService: jest.Mocked<RecipeApiService>;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [
                RecipeService,
                {
                    provide: DishApiService,
                    useValue: mockDishApiService
                },
                {
                    provide: ProviderRegistryService,
                    useValue: mockProviderRegistryService
                },
                {
                    provide: TranslationService,
                    useValue: mockTranslationService
                }
            ]
        }).compile();

        service = module.get(RecipeService);
        providerRegistryService = module.get(ProviderRegistryService);
        translationService = module.get(TranslationService);

        dishApiService = providerRegistryService.getDishApiService() as jest.Mocked<DishApiService>;
        recipeApiService = providerRegistryService.getRecipeApiService() as jest.Mocked<RecipeApiService>;
    });

    describe('create', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should fail when dish has not been found', async () => {
            dishApiService.findByDishId.mockResolvedValueOnce(null);

            await expect(service.create(encodedDishIdVoFixture, createRecipeDtoFixture, userFixture)).rejects.toThrow(DishNotFoundError);
        });

        it('should fail when user is not an author and admin', async () => {
            dishApiService.findByDishId.mockResolvedValueOnce(dishEntityWithAuthorFixture);

            await expect(service.create(encodedDishIdVoFixture, createRecipeDtoFixture, anotherUserFixture)).rejects.toThrow(NotDishAuthorError);
        });

        it('should fail when recipe exists for this dish', async () => {
            dishApiService.findByDishId.mockResolvedValueOnce(dishEntityWithAuthorFixture);
            recipeApiService.findRecipeByDishId.mockResolvedValueOnce(recipeEntityFixture);

            await expect(service.create(encodedDishIdVoFixture, createRecipeDtoFixture, authorUserFixture)).rejects.toThrow(DishRecipeExistsError);
        });

        it('should create a new recipe and cache', async () => {
            dishApiService.findByDishId.mockResolvedValueOnce(dishEntityWithAuthorFixture);
            recipeApiService.findRecipeByDishId.mockResolvedValueOnce(null);
            recipeApiService.createRecipe.mockResolvedValueOnce(recipeEntityFixture);

            const result = await service.create(encodedDishIdVoFixture, createRecipeDtoFixture, authorUserFixture);

            expect(result).toBe(recipeEntityFixture);
        });
    });

    describe('getTranslatedRecipe', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should throw DishRecipeNotFoundError if no recipe found', async () => {
            mockProvidable.getDishRecipe.mockResolvedValueOnce(null);

            await expect(service.getTranslatedRecipe(encodedDishIdVoFixture, 'en')).rejects.toThrow(DishRecipeNotFoundError);
        });

        it('should translate recipe if not cached', async () => {
            mockProvidable.getDishRecipe.mockResolvedValueOnce(recipeEntityFixture);
            translationService.translateRecipe.mockResolvedValueOnce({ translated: translatedRecipeEntityFixture, original: recipeEntityFixture });

            const result = await service.getTranslatedRecipe(encodedDishIdVoFixture, 'pl');

            expect(result).toBe(translatedRecipeEntityFixture);
        });
    });
});