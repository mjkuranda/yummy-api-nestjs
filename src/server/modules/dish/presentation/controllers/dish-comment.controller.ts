import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { DishQueryFacade } from '../../application/dish-query.facade';
import { DishCommandFacade } from '../../application/dish-command.facade';
import { GetDishCommentsDto } from '../../application/dtos';
import { AuthenticationGuard } from '../../../../guards/authentication.guard';
import { CreateDishCommentDto } from '../../application/dtos';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { User } from '../../../../decorators';
import { EncodedDishIdValidationPipe } from '../../../../pipes';

@Controller('dishes')
export class DishCommentController {

    constructor(
        private readonly dishQueryFacade: DishQueryFacade,
        private readonly dishCommandFacade: DishCommandFacade
    ) {}

    @Get('/:encoded-dish-id/comments')
    @HttpCode(200)
    public async getDishComments(
        @Param('encoded-dish-id', EncodedDishIdValidationPipe) encodedDishId: string
    ): Promise<GetDishCommentsDto> {
        return await this.dishQueryFacade.getDishComments(encodedDishId);
    }

    @Post('/:encoded-dish-id/comment')
    @HttpCode(201)
    @UseGuards(AuthenticationGuard)
    public async addDishComment(
        @Param('encoded-dish-id', EncodedDishIdValidationPipe) encodedDishId: string,
        @User() user: UserAccessTokenPayload,
        @Body() body: CreateDishCommentDto
    ): Promise<void> {
        return await this.dishCommandFacade.addDishComment(encodedDishId, user.login, body.text);
    }

}