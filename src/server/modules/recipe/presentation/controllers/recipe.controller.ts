import { Body, Controller, Get, Headers, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../../../../guards/authentication.guard';
import { CreateRecipeDto, GetRecipeDto } from '../../application/dtos';
import { Language } from '../../../../common/types';
import { RecipeFacade } from '../../application/recipe.facade';
import { User } from '../../../../decorators';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { EncodedDishIdValidationPipe } from '../../../../pipes';

@Controller('recipes')
export class RecipeController {

    constructor(
        private readonly recipeFacade: RecipeFacade
    ) {}

    @Post(':encoded-dish-id')
    @HttpCode(201)
    @UseGuards(AuthenticationGuard)
    public async createRecipe(
        @Param('encoded-dish-id', EncodedDishIdValidationPipe) encodedDishId: string,
        @User() user: UserAccessTokenPayload,
        @Body() createRecipeDto: CreateRecipeDto
    ): Promise<void> {
        return await this.recipeFacade.addRecipe(encodedDishId, createRecipeDto, user);
    }

    @Get(':encoded-dish-id')
    @HttpCode(200)
    public async getRecipe(
        @Param('encoded-dish-id', EncodedDishIdValidationPipe) encodedDishId: string,
        @Headers('accept-language') lang: Language = 'pl'
    ): Promise<GetRecipeDto> {
        return await this.recipeFacade.getRecipe(encodedDishId, lang);
    }
}