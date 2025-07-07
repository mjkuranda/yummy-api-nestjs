import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
import { DishQueryFacade } from '../../application/dish-query.facade';
import { AuthenticationGuard } from '../../../../guards/authentication.guard';
import { GetDishProposalsDto } from '../../application/dtos';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { User } from '../../../../decorators';

@Controller('dish-recommendations')
export class DishRecommendationController {

    constructor(
        private readonly dishQueryFacade: DishQueryFacade
    ) {}

    @Get()
    @HttpCode(200)
    @UseGuards(AuthenticationGuard)
    public async getDishProposal(
        @User() user: UserAccessTokenPayload
    ): Promise<GetDishProposalsDto> {
        return await this.dishQueryFacade.getDishProposal(user);
    }

}