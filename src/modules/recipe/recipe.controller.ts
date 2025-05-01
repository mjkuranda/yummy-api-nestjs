import { Body, Controller, Get, Headers, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../../guards/authentication.guard';
import { CreateRecipeDto } from './recipe.dto';
import { RecipeService } from './recipe.service';
import { TransformedBody } from '../../common/interfaces';
import { TranslationService } from '../translation/translation.service';
import { Language } from '../../common/types';

@Controller('recipes')
export class RecipeController {

    constructor(
        private readonly recipeService: RecipeService,
        private readonly translationService: TranslationService
    ) {}

    @Post(':dishId')
    @HttpCode(201)
    @UseGuards(AuthenticationGuard)
    public async createRecipe(@Param('dishId') dishId: string, @Body() createRecipeDto: TransformedBody<CreateRecipeDto>) {
        const { data, authenticatedUser } = createRecipeDto;

        return await this.recipeService.create(dishId, data, authenticatedUser);
    }

    @Get(':dishId')
    @HttpCode(200)
    public async getRecipe(@Param('dishId') dishId: string, @Headers('accept-language') lang: Language = 'pl') {
        const recipe = await this.recipeService.get(dishId);
        const { translated: translatedRecipe } = await this.translationService.translateRecipe(recipe, lang);

        return translatedRecipe;
    }
}