import { createMock } from '../../../../../common/__tests__/helpers';
import { DishTokenService } from '../../../../dish/domain/common/services';
import { RecipeService } from '../../../domain/services/recipe.service';

export const mockDishTokenService = createMock<DishTokenService>({
    decode: jest.fn()
});

export const mockRecipeService = createMock<RecipeService>({
    create: jest.fn(),
    getTranslatedRecipe: jest.fn()
});