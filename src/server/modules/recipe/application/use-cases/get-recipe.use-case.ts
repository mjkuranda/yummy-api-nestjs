import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString, Language } from '../../../../common/types';
import { LoggerService } from '../../../logger/logger.service';
import { RecipeService } from '../../domain/services/recipe.service';
import { DishNotFoundError, DishRecipeNotFoundError, InvalidDishIdError } from '../../../dish/domain/errors';
import { BadRequestException, NotFoundException } from '../../../../exceptions';
import { LanguageName } from '../../../../common/enums';
import { GetRecipeDto } from '../dtos';
import { RecipeDtoMapper } from '../recipe-dto.mapper';
import { DishTokenService } from '../../../dish/domain/common/services';

export class GetRecipeUseCase extends AbstractUseCase<[string, Language], GetRecipeDto> {

    constructor(
        private readonly dishTokenService: DishTokenService,
        private readonly loggerService: LoggerService,
        private readonly recipeService: RecipeService
    ) {
        super();
    }

    protected async run(encodedDishId: string, language: Language): Promise<GetRecipeDto> {
        const encodedDishIdVo = this.dishTokenService.decode(encodedDishId);
        const { recipe, fromCache } = await this.recipeService.getTranslatedRecipe(encodedDishIdVo, language);
        const languageName = LanguageName[language];

        this.loggerService.info(this.context, `Retrieved dish recipe "${encodedDishId}" in ${languageName} language ${fromCache ? 'from cache' : 'and cached'}.`);

        return RecipeDtoMapper.toGetRecipeDto(encodedDishIdVo, recipe);
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