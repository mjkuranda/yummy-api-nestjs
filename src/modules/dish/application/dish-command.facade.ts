import { Injectable } from '@nestjs/common';
import { DishDocument } from '../../../mongodb/documents/dish.document';
import { CreateDishCommentBody, CreateDishDto, CreateDishRatingBody, DishEditDto } from '../dish.dto';
import { UserDto } from '../../user/user.dto';
import { DishIngredient, DishIngredientWithoutImage } from '../../ingredient/ingredient.types';
import { UserAccessTokenPayload } from '../../jwt-manager/jwt-manager.types';
import { EncodedDishId } from '../../../common/types';
import { DishRatingDocument } from '../../../mongodb/documents/dish-rating.document';
import { CreateDishUseCase } from './use-cases/create-dish.use-case';
import { EditDishUseCase } from './use-cases/edit-dish.use-case';
import { DeleteDishUseCase } from './use-cases/delete-dish.use-case';
import { ConfirmDishCreationUseCase } from './use-cases/confirm-dish-creation.use-case';
import { ConfirmDishEditionUseCase } from './use-cases/confirm-dish-edition.use-case';
import { ConfirmDishDeletionUseCase } from './use-cases/confirm-dish-deletion.use-case';
import { AddDishProposalsUseCase } from './use-cases/add-dish-proposals.use-case';
import { AddDishCommentUseCase } from './use-cases/add-dish-comment.use-case';
import { AddDishRatingUseCase } from './use-cases/add-dish-rating.use-case';

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
    async createDish(createDishDto: CreateDishDto<DishIngredientWithoutImage>, user: UserAccessTokenPayload): Promise<DishDocument> {
        return await this.createDishUseCase.execute(createDishDto, user);
    }

    /**
     * @description Inserts a modification of the dish to the database
     * @param encodedDishId encoded dish ID with its provider name
     * @param dishEditDto dish edited data
     */
    async editDish(encodedDishId: EncodedDishId, dishEditDto: DishEditDto<DishIngredient>): Promise<void> {
        await this.editDishUseCase.execute(encodedDishId, dishEditDto);
    }

    /**
     * @description Marks dish as soft-deleted which causes not providing further
     * @param encodedDishId encoded dish ID and its provider name
     */
    async deleteDish(encodedDishId: EncodedDishId): Promise<boolean> {
        return this.deleteDishUseCase.execute(encodedDishId);
    }

    /**
     * @description Confirms creating a new dish
     * @param encodedDishId encoded dish ID and its provider name
     * @param user user DTO data // TODO: Should be simplified to have less information
     */
    async confirmCreating(encodedDishId: EncodedDishId, user: UserDto): Promise<void> {
        await this.confirmDishCreationUseCase.execute(encodedDishId, user);
    }

    /**
     * @description Confirms edition of existing dish
     * @param encodedDishId encoded dish ID and its provider
     * @param user user DTO
     */
    async confirmEditing(encodedDishId: EncodedDishId, user: UserDto): Promise<DishDocument> {
        return this.confirmDishEditionUseCase.execute(encodedDishId, user);
    }

    /**
     * @description Confirms deletion of existing dish
     * @param encodedDishId encoded dish ID and its provider name
     * @param user user DTO
     */
    async confirmDeleting(encodedDishId: EncodedDishId, user: UserDto): Promise<boolean> {
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
     * @param createCommentBody comment data including content, commenter and dish
     * @param user user login
     */
    async addDishComment(createCommentBody: CreateDishCommentBody, user: string): Promise<void> {
        return this.addDishCommentUseCase.execute(createCommentBody, user);
    }

    /**
     * @description adds a new rating for a particular dish
     * @param createRatingBody rating and encoded dish ID
     * @param user user login
     */
    async addDishRating(createRatingBody: CreateDishRatingBody, user: string): Promise<DishRatingDocument> {
        return this.addDishRatingUseCase.execute(createRatingBody, user);
    }
}