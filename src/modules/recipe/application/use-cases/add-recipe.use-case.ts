import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { DishRecipeDocument } from '../../../../mongodb/documents/dish-recipe-document';
import { ContextString, EncodedDishId } from '../../../../common/types';
import { CreateRecipeDto } from '../../recipe.dto';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { RecipeService } from '../recipe.service';
import { DishNotFoundError, DishRecipeExistsError, NotDishAuthorError } from '../../../../errors/domain';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { ForbiddenException } from '../../../../exceptions/forbidden-exception';
import { LoggerService } from '../../../logger/logger.service';
import { InvalidMongooseObjectIdError } from '../../../../errors/infrastructure';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';

export class AddRecipeUseCase extends AbstractUseCase<[EncodedDishId, CreateRecipeDto, UserAccessTokenPayload], DishRecipeDocument> {

    constructor(
        private readonly recipeService: RecipeService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    async execute(encodedDishId: EncodedDishId, createRecipeDto: CreateRecipeDto, userDto: UserAccessTokenPayload): Promise<DishRecipeDocument> {
        const context: ContextString = 'AddRecipeUseCase/execute';

        try {
            const newRecipe = await this.recipeService.create(encodedDishId, createRecipeDto, userDto);

            this.loggerService.info(context, `New recipe "${newRecipe._id}" created for dish "${newRecipe.dishId}"`);

            return newRecipe;
        } catch (err: unknown) {
            if (err instanceof InvalidMongooseObjectIdError) {
                throw new BadRequestException(context, err.message);
            }

            if (err instanceof DishNotFoundError) {
                throw new NotFoundException(context, err.message);
            }

            if (err instanceof NotDishAuthorError) {
                throw new ForbiddenException(context, err.message);
            }

            if (err instanceof DishRecipeExistsError) {
                throw new ForbiddenException(context, err.message);
            }
        }
    }

}