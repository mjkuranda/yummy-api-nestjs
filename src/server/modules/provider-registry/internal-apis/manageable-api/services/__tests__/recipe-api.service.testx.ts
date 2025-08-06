import { RecipeApiService } from '../recipe-api.service';
import { RecipeRepository } from '../../../../../recipe/domain/recipe.repository';
import { RepositoryMap } from '../../../../../../common/types';
import { createMockInstance } from '../../../../../../common/__tests__/helpers';
import { createMockRepositoryMap, mockRecipeRepository } from '../__mocks__/services.mock';
import {
    createRecipeDtoFixture,
    dishIdFixture,
    expectedRecipe,
    languageFixture
} from '../__fixtures__/recipe-api.service.fixture';
import { Repository } from '../../../../../../common/enums';

describe('RecipeApiService', () => {
    let recipeApiService: RecipeApiService;
    let recipeRepository: jest.Mocked<RecipeRepository>;
    let repositoryMap: jest.Mocked<RepositoryMap>;

    beforeEach(() => {
        recipeRepository = createMockInstance(mockRecipeRepository);
        repositoryMap = createMockRepositoryMap({
            [Repository.RECIPE_REPOSITORY]: recipeRepository
        });

        recipeApiService = new RecipeApiService(repositoryMap);
    });

    describe('createRecipe', () => {
        it('should call createRecipe from repository', async () => {
            recipeRepository.createRecipe.mockResolvedValueOnce(expectedRecipe);

            const result = await recipeApiService.createRecipe(createRecipeDtoFixture);

            expect(recipeRepository.createRecipe).toHaveBeenCalledTimes(1);
            expect(recipeRepository.createRecipe).toHaveBeenCalledWith(createRecipeDtoFixture);
            expect(result).toEqual(expectedRecipe);
        });
    });

    describe('findRecipeByDishId', () => {
        it('should call findRecipeByDishId from repository', async () => {
            recipeRepository.findRecipeByDishId.mockResolvedValueOnce(expectedRecipe);

            const result = await recipeApiService.findRecipeByDishId(dishIdFixture, languageFixture);

            expect(recipeRepository.findRecipeByDishId).toHaveBeenCalledTimes(1);
            expect(recipeRepository.findRecipeByDishId).toHaveBeenCalledWith(dishIdFixture, languageFixture);
            expect(result).toEqual(expectedRecipe);
        });
    });
});