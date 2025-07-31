import { Language } from '../../../../../../common/types';
import { RecipeEntity } from '../../../../../recipe/domain/entities';
import { CreateRecipeDto } from '../../../../../recipe/application/dtos';

export const dishIdFixture = 'dish-123';

export const languageFixture: Language = 'pl';

export const expectedRecipe: RecipeEntity = {} as any;

export const createRecipeDtoFixture: CreateRecipeDto = {} as any;