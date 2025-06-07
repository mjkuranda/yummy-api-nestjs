import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString, Language } from '../../../../common/types';
import { LoggerService } from '../../../logger/logger.service';
import { RecipeService } from '../../domain/services/recipe.service';
import { TranslationService } from '../../../translation/translation.service';
import { DishNotFoundError, DishRecipeNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { Recipe } from '../../domain/entities';
import { DishRecipeCacheService } from '../../../cache/dish-recipe/dish-recipe-cache.service';
import { EncodedDishId } from '../../../dish/encoded-dish-id.value-object';
import { LanguageName } from '../../../../common/enums';

export class GetRecipeUseCase extends AbstractUseCase<[EncodedDishId, Language], Recipe> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly recipeService: RecipeService,
        private readonly translationService: TranslationService,
        private readonly dishRecipeCacheService: DishRecipeCacheService
    ) {
        super();
    }

    async execute(encodedDishId: EncodedDishId, language: Language): Promise<Recipe> {
        const context: ContextString = 'GetRecipeUseCase/execute';
        const dishId = encodedDishId.getDishId();

        try {
            const cachedRecipe = await this.dishRecipeCacheService.getDishRecipe(encodedDishId, language);

            if (cachedRecipe) {
                this.loggerService.info(context, `Recipe for dish "${dishId}" found in cache`);

                return cachedRecipe;
            }

            const { recipe } = await this.recipeService.get(encodedDishId);
            const { translated: translatedRecipe } = await this.translationService.translateRecipe(recipe, language);
            const languageName = LanguageName[language];

            await this.dishRecipeCacheService.setDishRecipe(encodedDishId, recipe);
            await this.dishRecipeCacheService.setDishRecipe(encodedDishId, translatedRecipe);

            this.loggerService.info(context, `Retrieved recipe from dish "${recipe.dishId}" in ${languageName} language.`);

            return new Recipe(
                translatedRecipe.language,
                translatedRecipe.dishId,
                translatedRecipe.sections
            );
        } catch (err: unknown) {
            if (err instanceof InvalidDishIdError) {
                throw new BadRequestException(context, err.message);
            }

            if (err instanceof DishNotFoundError) {
                throw new NotFoundException(context, err.message);
            }

            if (err instanceof DishRecipeNotFoundError) {
                throw new NotFoundException(context, err.message);
            }
        }
    }

}