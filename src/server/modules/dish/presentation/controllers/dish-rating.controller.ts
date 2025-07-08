import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { DishQueryFacade } from '../../application/dish-query.facade';
import { DishCommandFacade } from '../../application/dish-command.facade';
import { EncodedDishIdVo } from '../../domain/common/vos';
import { AddedDishRatingDto, CreateDishRatingDto, GetDishRatingDto } from '../../application/dtos';
import { AuthenticationGuard } from '../../../../guards/authentication.guard';
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
    public async getDishRating(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdVo
    ): Promise<GetDishRatingDto> {
        return await this.dishQueryFacade.getDishRating(encodedDishId);
    }

    @Post('/:encoded-dish-id/rating')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard)
    public async addDishRating(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdVo,
        @User() user: UserAccessTokenPayload,
        @Body() body: CreateDishRatingDto
    ): Promise<AddedDishRatingDto> {
        return await this.dishCommandFacade.addDishRating(encodedDishId, user.login, body.rating);
    }

}