import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { DishQueryFacade } from '../../application/dish-query.facade';
import { DishCommandFacade } from '../../application/dish-command.facade';
import { EncodedDishIdValueObject } from '../../domain/common/value-objects';
import { AddedDishRatingDto, GetDishRatingDto } from '../../application/dtos';
import { AuthenticationGuard } from '../../../../guards/authentication.guard';
import { CreateDishRatingBody } from '../../dish.dto';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { User } from '../../../../decorators';

@Controller('dishes')
export class DishRatingController {

    constructor(
        private readonly dishQueryFacade: DishQueryFacade,
        private readonly dishCommandFacade: DishCommandFacade
    ) {}

    @Get('/:encoded-dish-id/rating')
    @HttpCode(200)
    public async getRating(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdValueObject
    ): Promise<GetDishRatingDto> {
        return await this.dishQueryFacade.getDishRating(encodedDishId);
    }

    @Post('/:encoded-dish-id/rating')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard)
    public async addRating(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdValueObject,
        @User() user: UserAccessTokenPayload,
        @Body() body: CreateDishRatingBody
    ): Promise<AddedDishRatingDto> {
        return await this.dishCommandFacade.addDishRating(encodedDishId, user.login, body.rating);
    }

}