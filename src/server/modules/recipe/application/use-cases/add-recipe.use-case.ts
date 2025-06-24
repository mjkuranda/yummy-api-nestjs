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
import { EncodedDishIdValueObject } from '../../../dish/domain/common/value-objects';
import { CreateRecipeDto } from '../dtos';
import { InvalidMongooseObjectIdError } from '../../../../common/errors';

export class AddRecipeUseCase extends AbstractUseCase<[EncodedDishIdValueObject, CreateRecipeDto, UserAccessTokenPayload], void> {

    constructor(
        private readonly recipeService: RecipeService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    async run(encodedDishId: EncodedDishIdValueObject, createRecipeDto: CreateRecipeDto, userDto: UserAccessTokenPayload): Promise<void> {
        await this.recipeService.create(encodedDishId, createRecipeDto, userDto);

        this.loggerService.info(this.context, `New recipe has been created for dish "${encodedDishId.getValue()}"`);
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