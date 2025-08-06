import { Test, TestingModule } from '@nestjs/testing';
import { GetRecipeUseCase } from '../get-recipe.use-case';
import { DishTokenService } from '../../../../dish/domain/common/services';
import { RecipeService } from '../../../domain/services/recipe.service';
import { mockDishTokenService } from '../__mocks__/services.mock';
import {
    createRecipeDtoFixture,
    encodedDishIdFixture,
    encodedDishIdVoFixture, recipeEntityFixture,
    userDtoFixture
} from '../__fixtures__/add-user.use-case.fixture';

describe('GetRecipeUseCase', () => {
    let useCase: GetRecipeUseCase;
    let dishTokenService: jest.Mocked<DishTokenService>;
    let recipeService: jest.Mocked<RecipeService>;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RecipeService,
                { provide: DishTokenService, useValue: mockDishTokenService }
            ],
        }).compile();

        recipeService = module.get(RecipeService);
    });

    describe('execute', () => {
        it('should get a recipe', async () => {
            const expectedResult = { fromCache: true, recipe: recipeEntityFixture };

            dishTokenService.decode.mockReturnValueOnce(encodedDishIdVoFixture);
            recipeService.getTranslatedRecipe.mockResolvedValueOnce(expectedResult);

            await useCase.execute(encodedDishIdFixture, 'pl');

            expect(dishTokenService.decode).toHaveBeenCalledWith(encodedDishIdFixture);
            expect(recipeService.getTranslatedRecipe).toHaveBeenCalledTimes(1);
            expect(recipeService.getTranslatedRecipe).toHaveBeenCalledWith(encodedDishIdVoFixture, 'pl');
        });
    });
});