import { AddRecipeUseCase } from '../add-recipe.use-case';
import { DishTokenService } from '../../../../dish/domain/common/services';
import { RecipeService } from '../../../domain/services/recipe.service';
import { LoggerService } from '../../../../logger/logger.service';
import { mockDishTokenService, mockRecipeService } from '../__mocks__/services.mock';
import { mockLoggerService } from '../../../../../common/__mocks__/services';
import {
    createRecipeDtoFixture,
    encodedDishIdFixture,
    encodedDishIdVoFixture, recipeEntityFixture,
    userDtoFixture
} from '../__fixtures__/add-user.use-case.fixture';
import { DishRecipeCacheService } from '../../../../cache/domains/dish-recipe/dish-recipe-cache.service';
import { createMockInstance } from '../../../../../common/__tests__/helpers';
import { mockDishRecipeCacheService } from '../../../domain/services/__mocks__/recipe-services.mock';

describe('AddRecipeUseCase', () => {
    let useCase: AddRecipeUseCase;
    let dishTokenService: jest.Mocked<DishTokenService>;
    let dishRecipeCacheService: jest.Mocked<DishRecipeCacheService>;
    let recipeService: jest.Mocked<RecipeService>;
    let loggerService: jest.Mocked<LoggerService>;

    beforeEach(() => {
        dishTokenService = createMockInstance(mockDishTokenService);
        dishRecipeCacheService = createMockInstance(mockDishRecipeCacheService);
        recipeService = createMockInstance(mockRecipeService);
        loggerService = createMockInstance(mockLoggerService);

        useCase = new AddRecipeUseCase(
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

        it('should create a new recipe and cache', async () => {
            dishTokenService.decode.mockReturnValueOnce(encodedDishIdVoFixture);
            recipeService.create.mockResolvedValueOnce(recipeEntityFixture);

            const result = await useCase.execute(encodedDishIdFixture, createRecipeDtoFixture, userDtoFixture);

            expect(dishTokenService.decode).toHaveBeenCalledWith(encodedDishIdFixture);
            expect(recipeService.create).toHaveBeenCalledTimes(1);
            expect(recipeService.create).toHaveBeenCalledWith(encodedDishIdVoFixture, createRecipeDtoFixture, userDtoFixture);
            expect(dishRecipeCacheService.setDishRecipe).toHaveBeenCalledTimes(1);
            expect(dishRecipeCacheService.setDishRecipe).toHaveBeenCalledWith(encodedDishIdVoFixture, recipeEntityFixture);
            expect(loggerService.info).toHaveBeenCalledTimes(1);
            expect(loggerService.error).toHaveBeenCalledTimes(0);
            expect(result).toBeUndefined();
        });
    });
});