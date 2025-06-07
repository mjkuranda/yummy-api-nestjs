import { CreateRecipeDto } from '../../recipe.dto';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { RecipeService } from '../../domain/services/recipe.service';
import {
    DishNotFoundError,
    DishRecipeExistsError,
    NotDishAuthorError
} from '../../../../errors/domain';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { ForbiddenException } from '../../../../exceptions/forbidden-exception';
import { LoggerService } from '../../../logger/logger.service';
import { Recipe } from '../../domain/entities';
import { EncodedDishId } from '../../../dish/encoded-dish-id.value-object';
import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';

export class AddRecipeUseCase extends AbstractUseCase<[EncodedDishId, CreateRecipeDto, UserAccessTokenPayload], Recipe> {

    constructor(
        private readonly recipeService: RecipeService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    async run(encodedDishId: EncodedDishId, createRecipeDto: CreateRecipeDto, userDto: UserAccessTokenPayload): Promise<Recipe> {
        const recipe = await this.recipeService.create(encodedDishId, createRecipeDto, userDto);

        this.loggerService.info(this.context, `New recipe has been created for dish "${recipe.dishId}"`);

        return recipe;
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof DishNotFoundError) {
            throw new NotFoundException(context, error.message);
        }

        if (error instanceof NotDishAuthorError) {
            throw new ForbiddenException(context, error.message);
        }

        if (error instanceof DishRecipeExistsError) {
            throw new ForbiddenException(context, error.message);
        }

        throw error;
    }

    protected get context(): ContextString {
        return 'AddRecipeUseCase/run';
    }
}