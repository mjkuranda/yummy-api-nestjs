import { createMock } from '../../../../../../common/__tests__/helpers';
import { RecipeRepository } from '../../../../../recipe/domain/recipe.repository';
import { RepositoryMap } from '../../../../../../common/types';

export const mockRecipeRepository = createMock<RecipeRepository>({
    createRecipe: jest.fn(),
    findRecipeByDishId: jest.fn()
});

export function createMockRepositoryMap(params: Partial<RepositoryMap>): jest.Mocked<RepositoryMap> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return createMock<RepositoryMap>(params);
}
