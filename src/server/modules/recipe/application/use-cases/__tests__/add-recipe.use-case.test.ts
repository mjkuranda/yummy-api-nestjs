import { AddRecipeUseCase } from '../add-recipe.use-case';
import { DishTokenService } from '../../../../dish/domain/common/services';
import { RecipeService } from '../../../domain/services/recipe.service';
import { LoggerService } from '../../../../logger/logger.service';
import { createMockInstance } from '../../../../../common/__tests__/helpers';
import { mockDishTokenService, mockRecipeService } from '../__mocks__/services.mock';
import { mockLoggerService } from '../../../../../common/__mocks__/services';
import {
    createRecipeDtoFixture,
    encodedDishIdFixture,
    encodedDishIdVoFixture, recipeEntityFixture,
    userDtoFixture
} from '../__fixtures__/add-user.use-case.fixture';

describe('AddRecipeUseCase', () => {
    let useCase: AddRecipeUseCase;
    let dishTokenService: jest.Mocked<DishTokenService>;
    let recipeService: jest.Mocked<RecipeService>;
    let loggerService: jest.Mocked<LoggerService>;

    beforeEach(() => {
        dishTokenService = createMockInstance(mockDishTokenService);
        recipeService = createMockInstance(mockRecipeService);
        loggerService = createMockInstance(mockLoggerService);

        useCase = new AddRecipeUseCase(
            dishTokenService,
            recipeService,
            loggerService
        );
    });

    describe('execute', () => {
        it('should create a new recipe', async () => {
            dishTokenService.decode.mockReturnValueOnce(encodedDishIdVoFixture);
            recipeService.create.mockResolvedValueOnce(recipeEntityFixture);

            const result = await useCase.execute(encodedDishIdFixture, createRecipeDtoFixture, userDtoFixture);

            expect(dishTokenService.decode).toHaveBeenCalledWith(encodedDishIdFixture);
            expect(recipeService.create).toHaveBeenCalledTimes(1);
            expect(recipeService.create).toHaveBeenCalledWith(encodedDishIdVoFixture, createRecipeDtoFixture, userDtoFixture);
            expect(result).toBeUndefined();
        });
    });
});