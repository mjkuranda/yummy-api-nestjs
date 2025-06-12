import { Body, Controller, Get, Headers, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../../guards/authentication.guard';
import { CreateRecipeDto } from './application/dtos/recipe.dto';
import { TransformedBody } from '../../common/interfaces';
import { Language } from '../../common/types';
import { RecipeFacade } from './application/recipe.facade';
import { EncodedDishId } from '../dish/domain/common/encoded-dish-id.value-object';
import { ParseEncodedDishIdPipe } from '../../pipes/parse-encoded-dish-id.pipe';

@Controller('recipes')
export class RecipeController {

    constructor(
        private readonly recipeFacade: RecipeFacade
    ) {}

    @Post(':encoded-id')
    @HttpCode(201)
    @UseGuards(AuthenticationGuard)
    public async createRecipe(
        @Param('encoded-id', ParseEncodedDishIdPipe) encodedDishId: EncodedDishId,
        @Body() createRecipeDto: TransformedBody<CreateRecipeDto>
    ) {
        const { data, authenticatedUser } = createRecipeDto;

        return await this.recipeFacade.addRecipe(encodedDishId, data, authenticatedUser);
    }

    @Get(':encoded-id')
    @HttpCode(200)
    public async getRecipe(
        @Param('encoded-id', ParseEncodedDishIdPipe) encodedDishId: EncodedDishId,
        @Headers('accept-language') lang: Language = 'pl'
    ) {
        return await this.recipeFacade.getRecipe(encodedDishId, lang);
    }
}