import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString, Language } from '../../../../common/types';
import { LoggerService } from '../../../logger/logger.service';
import { RecipeService } from '../../domain/services/recipe.service';
import { DishNotFoundError, DishRecipeNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { Recipe } from '../../domain/entities';
import { EncodedDishId } from '../../../dish/encoded-dish-id.value-object';
import { LanguageName } from '../../../../common/enums';

export class GetRecipeUseCase extends AbstractUseCase<[EncodedDishId, Language], Recipe> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly recipeService: RecipeService
    ) {
        super();
    }

    async execute(encodedDishId: EncodedDishId, language: Language): Promise<Recipe> {
        const context: ContextString = 'GetRecipeUseCase/execute';

        try {
            const { recipe, fromCache } = await this.recipeService.getTranslatedRecipe(encodedDishId, language);
            const languageName = LanguageName[language];

            this.loggerService.info(context, `Retrieved dish recipe "${encodedDishId}" in ${languageName} language ${fromCache ? 'from cache' : 'and cached'}.`);

            return recipe;
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