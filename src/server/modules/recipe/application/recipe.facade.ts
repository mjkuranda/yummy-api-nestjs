import { AddRecipeUseCase, GetRecipeUseCase } from './use-cases';
import { Language } from '../../../common/types';
import { CreateRecipeDto, GetRecipeDto } from './dtos';
import { UserAccessTokenPayload } from '../../jwt-manager/jwt-manager.types';
import { EncodedDishIdValueObject } from '../../dish/domain/common/value-objects';

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
    async addRecipe(encodedDishId: EncodedDishIdValueObject, data: CreateRecipeDto, authenticatedUser: UserAccessTokenPayload): Promise<void> {
        return await this.addRecipeUseCase.execute(encodedDishId, data, authenticatedUser);
    }

    /**
     * @description returns a recipe assigned to the dish
     * @param encodedDishId encoded dish ID and its provider name
     * @param language recipe language
     */
    async getRecipe(encodedDishId: EncodedDishIdValueObject, language: Language): Promise<GetRecipeDto> {
        return await this.getRecipeUseCase.execute(encodedDishId, language);
    }

}