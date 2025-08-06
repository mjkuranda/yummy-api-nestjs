import { EncodedDishIdVo } from '../../../../dish/domain/common/vos';
import { UserAccessTokenPayload } from '../../../../jwt-manager/jwt-manager.types';
import { CreateRecipeDto } from '../../../application/dtos';
import { DishEntity } from '../../../../dish/domain/common/entities';
import { DishType, MealType, Provider } from '../../../../../common/enums';
import { RecipeEntity } from '../../entities';

export const encodedDishIdVoFixture = {
    getValue: () => 'encoded',
    getDishId: () => 'dishId',
    getProvider: () => Provider.INT_DMT_USER
} as EncodedDishIdVo;

export const createRecipeDtoFixture = {
    language: 'en',
    dishId: 'dishId',
    sections: []
} as CreateRecipeDto;

export const userFixture = {
    login: 'user1',
    isAdmin: false
} as UserAccessTokenPayload;

export const dishEntityWithAuthorFixture: DishEntity = new DishEntity({
    id: '123',
    dishType: DishType.ANY,
    mealType: MealType.ANY,
    language: 'pl',
    author: 'JOHN',
    provider: Provider.INT_DMT_USER,
    ingredients: [],
    readyInMinutes: 10,
    description: 'abc',
    title: 'untitled',
    posted: Date.now(),
    imageUrl: null
});

export const anotherUserFixture: UserAccessTokenPayload = {
    login: 'ANOTHER JOHN',
    isAdmin: false,
    expirationTimestamp: Date.now() + 1000000
};

export const authorUserFixture: UserAccessTokenPayload = {
    login: 'JOHN',
    isAdmin: true,
    expirationTimestamp: Date.now() + 100000
};

export const recipeEntityFixture: RecipeEntity = new RecipeEntity('en', '123', [{ name: '', steps: ['a', 'b'] }]);
export const translatedRecipeEntityFixture: RecipeEntity = new RecipeEntity('pl', '123', [{ name: '', steps: ['a', 'b'] }]);

export const cachedRecipeEntityFixture: RecipeEntity = new RecipeEntity('en', 'dishId', [{ name: '', steps: ['a', 'b'] }]);