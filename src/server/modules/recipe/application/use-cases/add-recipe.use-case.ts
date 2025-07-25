import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { RecipeService } from '../../domain/services/recipe.service';
import {
    DishNotFoundError,
    DishRecipeExistsError,
    NotDishAuthorError,
    DishRecipeNotFoundError
} from '../../../dish/domain/errors';
import { NotFoundException, ForbiddenException, BadRequestException } from '../../../../exceptions';
import { LoggerService } from '../../../logger/logger.service';
import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { CreateRecipeDto } from '../dtos';
import { InvalidMongooseObjectIdError } from '../../../../common/errors';
import { DishTokenService } from '../../../dish/domain/common/services';

export class AddRecipeUseCase extends AbstractUseCase<[string, CreateRecipeDto, UserAccessTokenPayload], void> {

    constructor(
        private readonly dishTokenService: DishTokenService,
        private readonly recipeService: RecipeService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    async run(encodedDishId: string, createRecipeDto: CreateRecipeDto, userDto: UserAccessTokenPayload): Promise<void> {
        const encodedDishIdVo = this.dishTokenService.decode(encodedDishId);

        await this.recipeService.create(encodedDishIdVo, createRecipeDto, userDto);

        this.loggerService.info(this.context, `New recipe has been created for dish "${encodedDishId}"`);
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof InvalidMongooseObjectIdError) {
            throw new NotFoundException(context, error.message);
        }

        if (error instanceof DishNotFoundError) {
            throw new NotFoundException(context, error.message);
        }

        if (error instanceof NotDishAuthorError) {
            throw new ForbiddenException(context, error.message);
        }

        if (error instanceof DishRecipeExistsError) {
            throw new ForbiddenException(context, error.message);
        }

        if (error instanceof DishRecipeNotFoundError) {
            throw new BadRequestException(context, error.message);
        }

        throw error;
    }

    protected get context(): ContextString {
        return 'AddRecipeUseCase/run';
    }
}