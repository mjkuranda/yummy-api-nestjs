import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { DishQueryFacade } from '../../application/dish-query.facade';
import { DishCommandFacade } from '../../application/dish-command.facade';
import { EncodedDishIdValueObject } from '../../domain/common/value-objects';
import { GetDishCommentsDto } from '../../application/dtos';
import { AuthenticationGuard } from '../../../../guards/authentication.guard';
import { CreateDishCommentBody } from '../../dish.dto';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { User } from '../../../../decorators';

@Controller('dishes')
export class DishCommentController {

    constructor(
        private readonly dishQueryFacade: DishQueryFacade,
        private readonly dishCommandFacade: DishCommandFacade
    ) {}

    @Get('/:encoded-dish-id/comments')
    @HttpCode(200)
    public async getDishComments(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdValueObject
    ): Promise<GetDishCommentsDto> {
        return await this.dishQueryFacade.getDishComments(encodedDishId);
    }

    @Post('/:encoded-dish-id/comment')
    @HttpCode(201)
    @UseGuards(AuthenticationGuard)
    public async addDishComment(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdValueObject,
        @User() user: UserAccessTokenPayload,
        @Body() body: CreateDishCommentBody
    ): Promise<void> {
        return await this.dishCommandFacade.addDishComment(encodedDishId, user.login, body.text);
    }

}