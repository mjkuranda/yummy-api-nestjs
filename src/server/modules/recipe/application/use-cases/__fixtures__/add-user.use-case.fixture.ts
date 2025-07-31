import { CreateRecipeDto } from '../../dtos';
import { UserAccessTokenPayload } from '../../../../jwt-manager/jwt-manager.types';
import { EncodedDishIdVo } from '../../../../dish/domain/common/vos';
import { Provider } from '../../../../../common/enums';
import { RecipeEntity } from '../../../domain/entities';

export const encodedDishIdFixture: string = 'dish-123';
export const createRecipeDtoFixture: CreateRecipeDto = {} as any;
export const userDtoFixture: UserAccessTokenPayload = {} as any;

export const encodedDishIdVoFixture: EncodedDishIdVo = new EncodedDishIdVo('encoded', Provider.INT_DMT_USER, '123');
export const recipeEntityFixture: RecipeEntity = new RecipeEntity('pl', '123', [{ name: '', steps: ['a', 'b'] }]);