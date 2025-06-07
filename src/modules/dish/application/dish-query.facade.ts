import { Injectable } from '@nestjs/common';
import { Language } from '../../../common/types';
import { DetailedDishWithTranslations, DishRating, ProposedDish, RatedDish } from '../dish.types';
import { DishDocument } from '../../../mongodb/documents/dish.document';
import { IngredientType } from '../../ingredient/ingredient.types';
import { MealType } from '../../../common/enums';
import { UserAccessTokenPayload } from '../../jwt-manager/jwt-manager.types';
import { DishCommentDocument } from '../../../mongodb/documents/dish-comment.document';
import { GetDishDetailsUseCase, GetDishesUseCase, GetDishProposalsUseCase, GetDishesWithSoftAddedUseCase, GetDishesWithSoftEditedUseCase, GetDishesWithSoftDeletedUseCase, GetDishCommentsUseCase, GetDishRatingUseCase } from './use-cases';
import { EncodedDishId } from '../encoded-dish-id.value-object';

@Injectable()
export class DishQueryFacade {

    constructor(
        private readonly getDishesUseCase: GetDishesUseCase,
        private readonly getDishDetailsUseCase: GetDishDetailsUseCase,
        private readonly getDishProposalsUseCase: GetDishProposalsUseCase,
        private readonly getDishesWithSoftAddedUseCase: GetDishesWithSoftAddedUseCase,
        private readonly getDishesWithSoftEditedUseCase: GetDishesWithSoftEditedUseCase,
        private readonly getDishesWithSoftDeletedUseCase: GetDishesWithSoftDeletedUseCase,
        private readonly getDishCommentsUseCase: GetDishCommentsUseCase,
        private readonly getDishRatingUseCase: GetDishRatingUseCase
    ) {}

    /**
     * @description Returns dishes from all providers
     * @param ings listed ingredients, provided by user
     * @param mealType filter dishes by meal type, e.g. breakfast, launch, beverage, etc...
     */
    async getDishes(ings: IngredientType[], mealType: MealType): Promise<RatedDish[]> {
        return await this.getDishesUseCase.execute(ings, mealType);
    }

    /**
     * @description Returns detailed dish
     * @param encodedDishId dish ID
     * @param language requested language to translate the dish
     */
    async getDishDetails(encodedDishId: EncodedDishId, language: Language): Promise<DetailedDishWithTranslations> {
        return await this.getDishDetailsUseCase.execute(encodedDishId, language);
    }

    /**
     * Returns proposed dishes for a particular user
     * @param user data from user access token
     */
    async getDishProposal(user: UserAccessTokenPayload): Promise<ProposedDish[]> {
        return this.getDishProposalsUseCase.execute(user);
    }

    /**
     * @description Returns all dishes, marked as softAdded
     */
    async getDishesWithSoftAdded(): Promise<DishDocument[]> {
        return await this.getDishesWithSoftAddedUseCase.execute();
    }

    /**
     * @description Returns all dishes with proposed changes
     */
    async getDishesWithSoftEdited(): Promise<DishDocument[]> {
        return await this.getDishesWithSoftEditedUseCase.execute();
    }

    /**
     * @description Returns all dishes, marked as softDeleted
     */
    async getDishesWithSoftDeleted(): Promise<DishDocument[]> {
        return await this.getDishesWithSoftDeletedUseCase.execute();
    }

    /**
     * @description Returns all comments for a particular dish
     * @param encodedDishId encoded dish ID and its provider name
     */
    async getDishComments(encodedDishId: EncodedDishId): Promise<DishCommentDocument[]> {
        return this.getDishCommentsUseCase.execute(encodedDishId);
    }

    /**
     * @description calculates a rating for a particular dish
     * @param encodedDishId encoded dish ID and its provider name
     */
    async getDishRating(encodedDishId: EncodedDishId): Promise<DishRating> {
        return this.getDishRatingUseCase.execute(encodedDishId);
    }
}