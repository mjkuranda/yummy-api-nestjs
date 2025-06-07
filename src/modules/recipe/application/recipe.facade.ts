import { AddRecipeUseCase, GetRecipeUseCase } from './use-cases';
import { DishRecipe } from './recipe-application.types';
import { EncodedDishId, Language } from '../../../common/types';
import { CreateRecipeDto } from '../recipe.dto';
import { UserAccessTokenPayload } from '../../jwt-manager/jwt-manager.types';
import { DishRecipeDocument } from '../../../mongodb/documents/dish-recipe-document';

export class RecipeFacade {

    constructor(
        private readonly addRecipeUseCase: AddRecipeUseCase,
        private readonly getRecipeUseCase: GetRecipeUseCase
    ) {}

    /**
     * @description adds a new recipe to a specific dish
     * @param encodedDishId encoded dish ID and its provider
     * @param data recipe DTO
     * @param authenticatedUser user DTO
     */
    async addRecipe(encodedDishId: EncodedDishId, data: CreateRecipeDto, authenticatedUser: UserAccessTokenPayload): Promise<DishRecipeDocument> {
        return await this.addRecipeUseCase.execute(encodedDishId, data, authenticatedUser);
    }

    /**
     * @description returns a recipe assigned to the dish
     * @param encodedDishId encoded dish ID and its provider name
     * @param language recipe language
     */
    async getRecipe(encodedDishId: EncodedDishId, language: Language): Promise<DishRecipe> {
        return await this.getRecipeUseCase.execute(encodedDishId, language);
    }

}