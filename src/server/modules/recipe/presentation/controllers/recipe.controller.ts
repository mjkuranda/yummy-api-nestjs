import { Body, Controller, Get, Headers, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../../../../guards/authentication.guard';
import { CreateRecipeDto, GetRecipeDto } from '../../application/dtos';
import { Language } from '../../../../common/types';
import { RecipeFacade } from '../../application/recipe.facade';
import { ParseEncodedDishIdPipe } from '../../../../pipes/parse-encoded-dish-id.pipe';
import { EncodedDishIdValueObject } from '../../../dish/domain/common/value-objects';
import { User } from '../../../../decorators';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';

@Controller('recipes')
export class RecipeController {

    constructor(
        private readonly recipeFacade: RecipeFacade
    ) {}

    @Post(':encoded-dish-id')
    @HttpCode(201)
    @UseGuards(AuthenticationGuard)
    public async createRecipe(
        @Param('encoded-dish-id', ParseEncodedDishIdPipe) encodedDishId: EncodedDishIdValueObject,
        @User() user: UserAccessTokenPayload,
        @Body() createRecipeDto: CreateRecipeDto
    ): Promise<void> {
        return await this.recipeFacade.addRecipe(encodedDishId, createRecipeDto, user);
    }

    @Get(':encoded-dish-id')
    @HttpCode(200)
    public async getRecipe(
        @Param('encoded-dish-id', ParseEncodedDishIdPipe) encodedDishId: EncodedDishIdValueObject,
        @Headers('accept-language') lang: Language = 'pl'
    ): Promise<GetRecipeDto> {
        return await this.recipeFacade.getRecipe(encodedDishId, lang);
    }
}