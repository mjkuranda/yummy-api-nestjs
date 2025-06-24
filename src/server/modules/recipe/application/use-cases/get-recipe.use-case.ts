import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString, Language } from '../../../../common/types';
import { LoggerService } from '../../../logger/logger.service';
import { RecipeService } from '../../domain/services/recipe.service';
import { DishNotFoundError, DishRecipeNotFoundError, InvalidDishIdError } from '../../../dish/domain/errors';
import { BadRequestException, NotFoundException } from '../../../../exceptions';
import { LanguageName } from '../../../../common/enums';
import { EncodedDishIdValueObject } from '../../../dish/domain/common/value-objects';
import { GetRecipeDto } from '../dtos';
import { RecipeDtoMapper } from '../recipe-dto.mapper';

export class GetRecipeUseCase extends AbstractUseCase<[EncodedDishIdValueObject, Language], GetRecipeDto> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly recipeService: RecipeService
    ) {
        super();
    }

    protected async run(encodedDishId: EncodedDishIdValueObject, language: Language): Promise<GetRecipeDto> {
        const { recipe, fromCache } = await this.recipeService.getTranslatedRecipe(encodedDishId, language);
        const languageName = LanguageName[language];

        this.loggerService.info(this.context, `Retrieved dish recipe "${encodedDishId.getValue()}" in ${languageName} language ${fromCache ? 'from cache' : 'and cached'}.`);

        return RecipeDtoMapper.toGetRecipeDto(encodedDishId, recipe);
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof InvalidDishIdError) {
            throw new BadRequestException(context, error.message);
        }

        if (error instanceof DishNotFoundError) {
            throw new NotFoundException(context, error.message);
        }

        if (error instanceof DishRecipeNotFoundError) {
            throw new NotFoundException(context, error.message);
        }

        throw error;
    }

    protected get context(): ContextString {
        return 'GetRecipeUseCase/run';
    }
}