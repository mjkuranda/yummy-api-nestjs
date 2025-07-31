jest.mock('../../../../../../integrations/spoonacular-api/spoonacular-api.service', () => jest.fn());

import { RecipeService } from '../recipe.service';
import { ProviderRegistryService } from '../../../../provider-registry/provider-registry.service';
import { DishRecipeCacheService } from '../../../../cache/domains/dish-recipe/dish-recipe-cache.service';
import { TranslationService } from '../../../../translation/translation.service';
import { DishNotFoundError, NotDishAuthorError, DishRecipeExistsError } from '../../../../dish/domain/errors';
import { DishApiService, RecipeApiService } from '../../../../provider-registry/internal-apis/manageable-api/services';
import { Providable } from '../../../../../common/interfaces';
import {
    mockDishApiService,
    mockDishRecipeCacheService,
    mockProviderRegistryService,
    mockTranslationService
} from '../__mocks__/recipe-services.mock';
import {
    anotherUserFixture, authorUserFixture,
    createRecipeDtoFixture,
    dishEntityWithAuthorFixture,
    encodedDishIdVoFixture, recipeEntityFixture,
    userFixture
} from '../__fixtures__/recipe.fixtures';
import { Test } from '@nestjs/testing';

describe('RecipeService', () => {
    let service: RecipeService;
    let providerRegistryService: jest.Mocked<ProviderRegistryService>;
    let dishRecipeCacheService: jest.Mocked<DishRecipeCacheService>;
    let translationService: jest.Mocked<TranslationService>;
    let dishApiService: jest.Mocked<DishApiService>;
    let recipeApiService: jest.Mocked<RecipeApiService>;
    let providable: jest.Mocked<Providable>;

    beforeEach(async () => {
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
                    provide: DishRecipeCacheService,
                    useValue: mockDishRecipeCacheService
                },
                {
                    provide: TranslationService,
                    useValue: mockTranslationService
                }
            ]
        }).compile();

        service = module.get(RecipeService);
        providerRegistryService = module.get(ProviderRegistryService);
        dishRecipeCacheService = module.get(DishRecipeCacheService);
        translationService = module.get(TranslationService);

        dishApiService = providerRegistryService.getDishApiService() as jest.Mocked<DishApiService>;
        recipeApiService = providerRegistryService.getRecipeApiService() as jest.Mocked<RecipeApiService>;
    });

    describe('create', () => {
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
            expect(dishRecipeCacheService.setDishRecipe).toHaveBeenCalledTimes(1);
            expect(dishRecipeCacheService.setDishRecipe).toHaveBeenCalledWith(encodedDishIdVoFixture, recipeEntityFixture);
        });
    });

    // describe('getTranslatedRecipe', () => {
    //     const encodedDishIdVo = {
    //         getProvider: () => 'provider',
    //         getValue: () => 'dishId'
    //     } as unknown as EncodedDishIdVo;
    //     const language = 'en';
    //
    //     it('should return cached recipe if available', async () => {
    //         const cachedRecipe = { language: 'en', dishId: 'dishId', sections: [{ name: '', steps: ['a', 'b'] }] };
    //         dishRecipeCacheService.getDishRecipe.mockResolvedValueOnce(cachedRecipe as any);
    //
    //         const result = await service.getTranslatedRecipe(encodedDishIdVo, language);
    //
    //         expect(result.recipe).toBe(cachedRecipe);
    //         expect(result.fromCache).toBe(true);
    //     });
    //
    //     it('should throw DishRecipeNotFoundError if no recipe found', async () => {
    //         dishRecipeCacheService.getDishRecipe.mockResolvedValueOnce(null);
    //         providable.getDishRecipe.mockResolvedValueOnce(null);
    //
    //         await expect(service.getTranslatedRecipe(encodedDishIdVo, language)).rejects.toThrow(DishRecipeNotFoundError);
    //     });
    //
    //     it('should translate and cache recipe if not cached', async () => {
    //         const dishRecipe = { language: 'en', dishId: 'dishId', sections: [{ name: '', steps: ['a', 'b'] }] };
    //         dishRecipeCacheService.getDishRecipe.mockResolvedValueOnce(null);
    //         providable.getDishRecipe.mockResolvedValueOnce(dishRecipe as any);
    //         translationService.translateRecipe.mockResolvedValue({ translated: dishRecipe } as any);
    //
    //         const result = await service.getTranslatedRecipe(encodedDishIdVo, language);
    //
    //         expect(result.recipe).toBe(dishRecipe);
    //         expect(dishRecipeCacheService.setDishRecipe).toHaveBeenCalled();
    //     });
    // });
});