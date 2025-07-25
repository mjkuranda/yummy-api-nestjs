import { Injectable } from '@nestjs/common';
import { EditDishDto } from './dtos';
import { DishIngredient, DishIngredientWithoutImage } from '../../ingredient/ingredient.types';
import { UserAccessTokenPayload } from '../../jwt-manager/jwt-manager.types';
import { CreateDishUseCase, EditDishUseCase, DeleteDishUseCase, ConfirmDishCreationUseCase, ConfirmDishEditionUseCase, ConfirmDishDeletionUseCase, AddDishProposalsUseCase, AddDishCommentUseCase, AddDishRatingUseCase } from './use-cases';
import { CreatedDishDto, ConfirmedEditingDto, ConfirmedDeletingDto, AddedDishRatingDto, CreateDishDto } from './dtos';

@Injectable()
export class DishCommandFacade {

    constructor(
        private readonly createDishUseCase: CreateDishUseCase,
        private readonly editDishUseCase: EditDishUseCase,
        private readonly deleteDishUseCase: DeleteDishUseCase,
        private readonly confirmDishCreationUseCase: ConfirmDishCreationUseCase,
        private readonly confirmDishEditionUseCase: ConfirmDishEditionUseCase,
        private readonly confirmDishDeletionUseCase: ConfirmDishDeletionUseCase,
        private readonly addDishProposalsUseCase: AddDishProposalsUseCase,
        private readonly addDishCommentUseCase: AddDishCommentUseCase,
        private readonly addDishRatingUseCase: AddDishRatingUseCase
    ) {}

    /**
     * @description Creates a new dish and saves to the database
     * @param createDishDto data to create new dish
     * @param user data from accessToken to define user
     */
    async createDish(createDishDto: CreateDishDto<DishIngredientWithoutImage>, user: UserAccessTokenPayload): Promise<CreatedDishDto> {
        return await this.createDishUseCase.execute(createDishDto, user);
    }

    /**
     * @description Inserts a modification of the dish to the database
     * @param encodedDishId encoded dish ID with its provider name
     * @param editDishDto dish edited data
     */
    async editDish(encodedDishId: string, editDishDto: EditDishDto<DishIngredient>): Promise<void> {
        await this.editDishUseCase.execute(encodedDishId, editDishDto);
    }

    /**
     * @description Marks dish as soft-deleted which causes not providing further
     * @param encodedDishId encoded dish ID and its provider name
     */
    async deleteDish(encodedDishId: string): Promise<boolean> {
        return this.deleteDishUseCase.execute(encodedDishId);
    }

    /**
     * @description Confirms creating a new dish
     * @param encodedDishId encoded dish ID and its provider name
     * @param user data from accessToken to define user
     */
    async confirmCreating(encodedDishId: string, user: UserAccessTokenPayload): Promise<void> {
        await this.confirmDishCreationUseCase.execute(encodedDishId, user);
    }

    /**
     * @description Confirms edition of existing dish
     * @param encodedDishId encoded dish ID and its provider
     * @param user data from accessToken to define user
     */
    async confirmEditing(encodedDishId: string, user: UserAccessTokenPayload): Promise<ConfirmedEditingDto> {
        return this.confirmDishEditionUseCase.execute(encodedDishId, user);
    }

    /**
     * @description Confirms deletion of existing dish
     * @param encodedDishId encoded dish ID and its provider name
     * @param user data from accessToken to define user
     */
    async confirmDeleting(encodedDishId: string, user: UserAccessTokenPayload): Promise<ConfirmedDeletingDto> {
        return this.confirmDishDeletionUseCase.execute(encodedDishId, user);
    }

    /**
     * @description Generate new dish proposals for a particular user based on last searches
     * @param user data extracted from access token
     * @param ingredients list of ingredients found in last searches
     */
    async addDishProposal(user: UserAccessTokenPayload, ingredients: string[]): Promise<void> {
        return this.addDishProposalsUseCase.execute(user, ingredients);
    }

    /**
     * @description posts a comment
     * @param encodedDishId encoded dishId and its provider name
     * @param userLogin user login
     * @param content comment text to post
     */
    async addDishComment(encodedDishId: string, userLogin: string, content: string): Promise<void> {
        return this.addDishCommentUseCase.execute(encodedDishId, userLogin, content);
    }

    /**
     * @description adds a new rating for a particular dish
     * @param encodedDishId encoded dish ID and its provider name
     * @param userLogin user login
     * @param rating integer value between 0 and 10
     */
    async addDishRating(encodedDishId: string, userLogin: string, rating: number): Promise<AddedDishRatingDto> {
        return this.addDishRatingUseCase.execute(encodedDishId, userLogin, rating);
    }
}