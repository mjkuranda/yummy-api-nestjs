import { Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { DishQueryFacade } from '../../application/dish-query.facade';
import { DishCommandFacade } from '../../application/dish-command.facade';
import { AuthenticationGuard } from '../../../../guards/authentication.guard';
import { CreationGuard } from '../../../../guards/creation.guard';
import { ConfirmedDeletingDto, ConfirmedEditingDto, GetDishesDto } from '../../application/dtos';
import { EditionGuard } from '../../../../guards/edition.guard';
import { DeletionGuard } from '../../../../guards/deletion.guard';
import { EncodedDishIdVo } from '../../domain/common/vos';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { User } from '../../../../decorators';

@Controller('dishes')
export class DishModerationController {

    constructor(
        private readonly dishQueryFacade: DishQueryFacade,
        private readonly dishCommandFacade: DishCommandFacade
    ) {}

    @Get('/soft-added')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, CreationGuard)
    public async getSoftAddedDishes(): Promise<GetDishesDto> {
        return await this.dishQueryFacade.getDishesWithSoftAdded();
    }

    @Get('/soft-edited')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, EditionGuard)
    public async getSoftEditedDishes(): Promise<GetDishesDto> {
        return await this.dishQueryFacade.getDishesWithSoftEdited();
    }

    @Get('/soft-deleted')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, DeletionGuard)
    public async getSoftDeletedDishes(): Promise<GetDishesDto> {
        return await this.dishQueryFacade.getDishesWithSoftDeleted();
    }

    @Post('/:encoded-dish-id/create')
    @HttpCode(204)
    @UseGuards(AuthenticationGuard, CreationGuard)
    public async confirmCreatingDish(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdVo,
        @User() user: UserAccessTokenPayload
    ): Promise<void> {
        return await this.dishCommandFacade.confirmCreating(encodedDishId, user);
    }

    @Post('/:encoded-dish-id/edit')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, EditionGuard)
    public async confirmEditingDish(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdVo,
        @User() user: UserAccessTokenPayload
    ): Promise<ConfirmedEditingDto> {
        return await this.dishCommandFacade.confirmEditing(encodedDishId, user);
    }

    @Post('/:encoded-dish-id/delete')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, DeletionGuard)
    public async confirmDeletingDish(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdVo,
        @User() user: UserAccessTokenPayload
    ): Promise<ConfirmedDeletingDto> {
        return await this.dishCommandFacade.confirmDeleting(encodedDishId, user);
    }

}
