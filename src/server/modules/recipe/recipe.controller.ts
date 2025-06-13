import { Body, Controller, Get, Headers, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../../guards/authentication.guard';
import { CreateRecipeDto, GetRecipeDto } from './application/dtos';
import { TransformedBody } from '../../common/interfaces';
import { Language } from '../../common/types';
import { RecipeFacade } from './application/recipe.facade';
import { ParseEncodedDishIdPipe } from '../../pipes/parse-encoded-dish-id.pipe';
import { EncodedDishIdValueObject } from '../dish/domain/common/value-objects';

@Controller('recipes')
export class RecipeController {

    constructor(
        private readonly recipeFacade: RecipeFacade
    ) {}

    @Post(':encoded-id')
    @HttpCode(201)
    @UseGuards(AuthenticationGuard)
    public async createRecipe(
        @Param('encoded-id', ParseEncodedDishIdPipe) encodedDishId: EncodedDishIdValueObject,
        @Body() createRecipeDto: TransformedBody<CreateRecipeDto>
    ): Promise<void> {
        const { data, authenticatedUser } = createRecipeDto;

        return await this.recipeFacade.addRecipe(encodedDishId, data, authenticatedUser);
    }

    @Get(':encoded-id')
    @HttpCode(200)
    public async getRecipe(
        @Param('encoded-id', ParseEncodedDishIdPipe) encodedDishId: EncodedDishIdValueObject,
        @Headers('accept-language') lang: Language = 'pl'
    ): Promise<GetRecipeDto> {
        return await this.recipeFacade.getRecipe(encodedDishId, lang);
    }
}