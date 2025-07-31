import { RecipeService } from '../recipe.service';
import { ProviderRegistryService } from '../../../../provider-registry/provider-registry.service';
import { DishRecipeCacheService } from '../../../../cache/domains/dish-recipe/dish-recipe-cache.service';
import { TranslationService } from '../../../../translation/translation.service';
import { DishNotFoundError, NotDishAuthorError, DishRecipeExistsError, DishRecipeNotFoundError } from '../../../../dish/domain/errors';
import { CreateRecipeDto } from '../../../application/dtos';
import { EncodedDishIdVo } from '../../../../dish/domain/common/vos';
import { UserAccessTokenPayload } from '../../../../jwt-manager/jwt-manager.types';
import { DishApiService, RecipeApiService } from '../../../../provider-registry/internal-apis/manageable-api/services';
import { Providable } from '../../../../../common/interfaces';
import { createMock } from '../../../../../common/__tests__/helpers';

describe('RecipeService', () => {
    let service: RecipeService;
    let mockProviderRegistryService: jest.Mocked<ProviderRegistryService>;
    let mockDishRecipeCacheService: jest.Mocked<DishRecipeCacheService>;
    let mockTranslationService: jest.Mocked<TranslationService>;
    let mockDishApiService: jest.Mocked<DishApiService>;
    let mockRecipeApiService: jest.Mocked<RecipeApiService>;
    let mockProvidable: jest.Mocked<Providable>;

    beforeEach(() => {
        mockDishApiService = createMock<DishApiService>({
            findByDishId: jest.fn()
        });

        mockRecipeApiService = createMock<RecipeApiService>({
            findRecipeByDishId: jest.fn(),
            createRecipe: jest.fn()
        });

        mockProvidable = createMock<Providable>({
            getLanguage: jest.fn(),
            getDishRecipe: jest.fn()
        });

        mockProviderRegistryService = createMock<ProviderRegistryService>({
            getDishApiService: jest.fn(() => mockDishApiService),
            getRecipeApiService: jest.fn(() => mockRecipeApiService),
            getProvider: jest.fn(() => mockProvidable)
        });

        mockDishRecipeCacheService = createMock<DishRecipeCacheService>({
            setDishRecipe: jest.fn(),
            getDishRecipe: jest.fn()
        });

        mockTranslationService = createMock<TranslationService>({
            translateRecipe: jest.fn()
        });

        service = new RecipeService(
            mockProviderRegistryService,
            mockDishRecipeCacheService,
            mockTranslationService
        );
    });

    describe('create', () => {
        const encodedDishIdVo = { getValue: () => 'encoded', getDishId: () => 'dishId' } as EncodedDishIdVo;
        const createRecipeDto = { language: 'en', dishId: 'dishId', sections: [] } as CreateRecipeDto;
        const user = { login: 'user1', isAdmin: false } as UserAccessTokenPayload;

        it('should throw DishNotFoundError if dish does not exist', async () => {
            mockDishApiService.findByDishId.mockResolvedValue(null);

            await expect(service.create(encodedDishIdVo, createRecipeDto, user)).rejects.toThrow(DishNotFoundError);
        });

        it('should throw NotDishAuthorError if user is not admin and not author', async () => {
            mockDishApiService.findByDishId.mockResolvedValue({ getAuthor: () => 'otherUser' } as any);

            await expect(service.create(encodedDishIdVo, createRecipeDto, user)).rejects.toThrow(NotDishAuthorError);
        });

        it('should throw DishRecipeExistsError if recipe already exists', async () => {
            mockDishApiService.findByDishId.mockResolvedValue({ getAuthor: () => user.login } as any);

            mockRecipeApiService.findRecipeByDishId.mockResolvedValue({} as any);
            await expect(service.create(encodedDishIdVo, createRecipeDto, user)).rejects.toThrow(DishRecipeExistsError);
        });

        it('should create and return new recipe', async () => {
            mockDishApiService.findByDishId.mockResolvedValue({ getAuthor: () => user.login } as any);
            mockRecipeApiService.findRecipeByDishId.mockResolvedValue(null);
            mockRecipeApiService.createRecipe.mockResolvedValue({ language: 'en', dishId: 'dishId', sections: [{ name: '', steps: ['a', 'b'] }] } as any);

            const result = await service.create(encodedDishIdVo, createRecipeDto, user);

            expect(result).toBeDefined();
            expect(mockDishRecipeCacheService.setDishRecipe).toHaveBeenCalled();
        });
    });

    describe('getTranslatedRecipe', () => {
        const encodedDishIdVo = {
            getProvider: () => 'provider',
            getValue: () => 'dishId'
        } as unknown as EncodedDishIdVo;
        const language = 'en';

        it('should return cached recipe if available', async () => {
            const cachedRecipe = { language: 'en', dishId: 'dishId', sections: [{ name: '', steps: ['a', 'b'] }] };
            mockDishRecipeCacheService.getDishRecipe.mockResolvedValueOnce(cachedRecipe as any);

            const result = await service.getTranslatedRecipe(encodedDishIdVo, language);

            expect(result.recipe).toBe(cachedRecipe);
            expect(result.fromCache).toBe(true);
        });

        it('should throw DishRecipeNotFoundError if no recipe found', async () => {
            mockDishRecipeCacheService.getDishRecipe.mockResolvedValueOnce(null);
            mockProvidable.getDishRecipe.mockResolvedValueOnce(null);

            await expect(service.getTranslatedRecipe(encodedDishIdVo, language)).rejects.toThrow(DishRecipeNotFoundError);
        });

        it('should translate and cache recipe if not cached', async () => {
            const dishRecipe = { language: 'en', dishId: 'dishId', sections: [{ name: '', steps: ['a', 'b'] }] };
            mockDishRecipeCacheService.getDishRecipe.mockResolvedValueOnce(null);
            mockProvidable.getDishRecipe.mockResolvedValueOnce(dishRecipe as any);
            mockTranslationService.translateRecipe.mockResolvedValue({ translated: dishRecipe } as any);

            const result = await service.getTranslatedRecipe(encodedDishIdVo, language);

            expect(result.recipe).toBe(dishRecipe);
            expect(mockDishRecipeCacheService.setDishRecipe).toHaveBeenCalled();
        });
    });
});