import { GetRecipeUseCase } from '../get-recipe.use-case';
import { DishTokenService } from '../../../../dish/domain/common/services';
import { RecipeService } from '../../../domain/services/recipe.service';
import { mockDishTokenService, mockRecipeService } from '../__mocks__/services.mock';
import {
    encodedDishIdFixture,
    encodedDishIdVoFixture, recipeEntityFixture
} from '../__fixtures__/add-user.use-case.fixture';
import { createMockInstance } from '../../../../../common/__tests__/helpers';
import { mockDishRecipeCacheService } from '../../../domain/services/__mocks__/recipe-services.mock';
import { mockLoggerService } from '../../../../../common/__mocks__/services';
import { DishRecipeCacheService } from '../../../../cache/domains/dish-recipe/dish-recipe-cache.service';
import { LoggerService } from '../../../../logger/logger.service';
import { cachedRecipeEntityFixture } from '../../../domain/services/__fixtures__/recipe.fixtures';
import { Language } from '../../../../../common/types';

describe('GetRecipeUseCase', () => {
    let useCase: GetRecipeUseCase;
    let dishTokenService: jest.Mocked<DishTokenService>;
    let dishRecipeCacheService: jest.Mocked<DishRecipeCacheService>;
    let recipeService: jest.Mocked<RecipeService>;
    let loggerService: jest.Mocked<LoggerService>;

    beforeAll(() => {
        dishTokenService = createMockInstance(mockDishTokenService);
        dishRecipeCacheService = createMockInstance(mockDishRecipeCacheService);
        recipeService = createMockInstance(mockRecipeService);
        loggerService = createMockInstance(mockLoggerService);

        useCase = new GetRecipeUseCase(
            dishTokenService,
            dishRecipeCacheService,
            recipeService,
            loggerService
        );
    });

    describe('execute', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should get a recipe', async () => {
            const mockLanguage: Language = 'pl';

            dishTokenService.decode.mockReturnValueOnce(encodedDishIdVoFixture);
            dishRecipeCacheService.getDishRecipe.mockResolvedValueOnce(null);
            recipeService.getTranslatedRecipe.mockResolvedValueOnce(recipeEntityFixture);

            const recipe = await useCase.execute(encodedDishIdFixture, mockLanguage);

            expect(dishTokenService.decode).toHaveBeenCalledWith(encodedDishIdFixture);
            expect(dishRecipeCacheService.getDishRecipe).toHaveBeenCalledTimes(1);
            expect(dishRecipeCacheService.getDishRecipe).toHaveBeenCalledWith(encodedDishIdVoFixture, mockLanguage);
            expect(recipeService.getTranslatedRecipe).toHaveBeenCalledTimes(1);
            expect(recipeService.getTranslatedRecipe).toHaveBeenCalledWith(encodedDishIdVoFixture, mockLanguage);
            expect(loggerService.info).toHaveBeenCalledTimes(1);
            expect(loggerService.error).toHaveBeenCalledTimes(0);
            expect(recipe).not.toBeUndefined();
        });

        it('should get a recipe from cache', async () => {
            const mockLanguage: Language = 'pl';

            dishTokenService.decode.mockReturnValueOnce(encodedDishIdVoFixture);
            dishRecipeCacheService.getDishRecipe.mockResolvedValueOnce(cachedRecipeEntityFixture);
            recipeService.getTranslatedRecipe.mockResolvedValueOnce(recipeEntityFixture);

            const recipe = await useCase.execute(encodedDishIdFixture, mockLanguage);

            expect(dishTokenService.decode).toHaveBeenCalledWith(encodedDishIdFixture);
            expect(dishRecipeCacheService.getDishRecipe).toHaveBeenCalledTimes(1);
            expect(dishRecipeCacheService.getDishRecipe).toHaveBeenCalledWith(encodedDishIdVoFixture, mockLanguage);
            expect(recipeService.getTranslatedRecipe).toHaveBeenCalledTimes(0);
            expect(loggerService.info).toHaveBeenCalledTimes(1);
            expect(loggerService.error).toHaveBeenCalledTimes(0);
            expect(recipe).not.toBeUndefined();
        });
    });
});