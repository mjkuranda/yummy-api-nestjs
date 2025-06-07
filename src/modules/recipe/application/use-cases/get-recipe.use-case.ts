import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString, EncodedDishId, Language } from '../../../../common/types';
import { DishRecipe } from '../recipe-application.types';
import { LoggerService } from '../../../logger/logger.service';
import { RecipeService } from '../../domain/services/recipe.service';
import { TranslationService } from '../../../translation/translation.service';
import { DishNotFoundError, DishRecipeNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { NotFoundException } from '../../../../exceptions/not-found.exception';

export class GetRecipeUseCase extends AbstractUseCase<[EncodedDishId, Language], DishRecipe> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly recipeService: RecipeService,
        private readonly translationService: TranslationService
    ) {
        super();
    }

    async execute(encodedDishId: EncodedDishId, language: Language): Promise<DishRecipe> {
        const context: ContextString = 'GetRecipeUseCase/execute';

        try {
            const { recipe, fromCache } = await this.recipeService.get(encodedDishId);
            const { translated: translatedRecipe } = await this.translationService.translateRecipe(recipe, language);

            this.loggerService.info(context, `Found recipe in cache for dish "${encodedDishId}" ${fromCache ? 'in cache' : 'and cached'}.`);

            return translatedRecipe;

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