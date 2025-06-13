import { Injectable } from '@nestjs/common';
import { CreateDishDto, DishEditDto } from '../dish.dto';
import { UserDto } from '../../user/user.dto';
import { DishIngredient, DishIngredientWithoutImage } from '../../ingredient/ingredient.types';
import { UserAccessTokenPayload } from '../../jwt-manager/jwt-manager.types';
import { CreateDishUseCase, EditDishUseCase, DeleteDishUseCase, ConfirmDishCreationUseCase, ConfirmDishEditionUseCase, ConfirmDishDeletionUseCase, AddDishProposalsUseCase, AddDishCommentUseCase, AddDishRatingUseCase } from './use-cases';
import { CreatedDishDto, ConfirmedEditingDto, ConfirmedDeletingDto, AddedDishRatingDto } from './dtos';
import { EncodedDishIdValueObject } from '../domain/common/value-objects';

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
     * @param dishEditDto dish edited data
     */
    async editDish(encodedDishId: EncodedDishIdValueObject, dishEditDto: DishEditDto<DishIngredient>): Promise<void> {
        await this.editDishUseCase.execute(encodedDishId, dishEditDto);
    }

    /**
     * @description Marks dish as soft-deleted which causes not providing further
     * @param encodedDishId encoded dish ID and its provider name
     */
    async deleteDish(encodedDishId: EncodedDishIdValueObject): Promise<boolean> {
        return this.deleteDishUseCase.execute(encodedDishId);
    }

    /**
     * @description Confirms creating a new dish
     * @param encodedDishId encoded dish ID and its provider name
     * @param user user DTO data // TODO: Should be simplified to have less information
     */
    async confirmCreating(encodedDishId: EncodedDishIdValueObject, user: UserDto): Promise<void> {
        await this.confirmDishCreationUseCase.execute(encodedDishId, user);
    }

    /**
     * @description Confirms edition of existing dish
     * @param encodedDishId encoded dish ID and its provider
     * @param user user DTO
     */
    async confirmEditing(encodedDishId: EncodedDishIdValueObject, user: UserDto): Promise<ConfirmedEditingDto> {
        return this.confirmDishEditionUseCase.execute(encodedDishId, user);
    }

    /**
     * @description Confirms deletion of existing dish
     * @param encodedDishId encoded dish ID and its provider name
     * @param user user DTO
     */
    async confirmDeleting(encodedDishId: EncodedDishIdValueObject, user: UserDto): Promise<ConfirmedDeletingDto> {
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
    async addDishComment(encodedDishId: EncodedDishIdValueObject, userLogin: string, content: string): Promise<void> {
        return this.addDishCommentUseCase.execute(encodedDishId, userLogin, content);
    }

    /**
     * @description adds a new rating for a particular dish
     * @param encodedDishId encoded dish ID and its provider name
     * @param userLogin user login
     * @param rating integer value between 0 and 10
     */
    async addDishRating(encodedDishId: EncodedDishIdValueObject, userLogin: string, rating: number): Promise<AddedDishRatingDto> {
        return this.addDishRatingUseCase.execute(encodedDishId, userLogin, rating);
    }
}