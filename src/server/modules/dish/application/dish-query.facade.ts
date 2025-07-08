import { Injectable } from '@nestjs/common';
import { Language } from '../../../common/types';
import { UserAccessTokenPayload } from '../../jwt-manager/jwt-manager.types';
import { GetDishDetailsUseCase, GetDishesUseCase, GetDishProposalsUseCase, GetDishesWithSoftAddedUseCase, GetDishesWithSoftEditedUseCase, GetDishesWithSoftDeletedUseCase, GetDishCommentsUseCase, GetDishRatingUseCase } from './use-cases';
import { EncodedDishIdVo } from '../domain/common/vos';
import {
    GetDishesDto,
    GetDishDetailsDto,
    GetDishCommentsDto,
    GetDishRatingDto,
    GetDishResultsDto,
    GetDishProposalsDto
} from './dtos';
import { GetDishesQueryDto } from './dtos/get-dishes-query.dto';

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
     * @param queryDto listed ingredients, provided by user filters: meal type and dish type
     */
    async getDishes(queryDto: GetDishesQueryDto): Promise<GetDishResultsDto> {
        return await this.getDishesUseCase.execute(queryDto);
    }

    /**
     * @description Returns detailed dish
     * @param encodedDishId dish ID
     * @param language requested language to translate the dish
     */
    async getDishDetails(encodedDishId: EncodedDishIdVo, language: Language): Promise<GetDishDetailsDto> {
        return await this.getDishDetailsUseCase.execute(encodedDishId, language);
    }

    /**
     * Returns proposed dishes for a particular user
     * @param user data from user access token
     */
    async getDishProposal(user: UserAccessTokenPayload): Promise<GetDishProposalsDto> {
        return this.getDishProposalsUseCase.execute(user);
    }

    /**
     * @description Returns all dishes, marked as softAdded
     */
    async getDishesWithSoftAdded(): Promise<GetDishesDto> {
        return await this.getDishesWithSoftAddedUseCase.execute();
    }

    /**
     * @description Returns all dishes with proposed changes
     */
    async getDishesWithSoftEdited(): Promise<GetDishesDto> {
        return await this.getDishesWithSoftEditedUseCase.execute();
    }

    /**
     * @description Returns all dishes, marked as softDeleted
     */
    async getDishesWithSoftDeleted(): Promise<GetDishesDto> {
        return await this.getDishesWithSoftDeletedUseCase.execute();
    }

    /**
     * @description Returns all comments for a particular dish
     * @param encodedDishId encoded dish ID and its provider name
     */
    async getDishComments(encodedDishId: EncodedDishIdVo): Promise<GetDishCommentsDto> {
        return this.getDishCommentsUseCase.execute(encodedDishId);
    }

    /**
     * @description calculates a rating for a particular dish
     * @param encodedDishId encoded dish ID and its provider name
     */
    async getDishRating(encodedDishId: EncodedDishIdVo): Promise<GetDishRatingDto> {
        return this.getDishRatingUseCase.execute(encodedDishId);
    }
}