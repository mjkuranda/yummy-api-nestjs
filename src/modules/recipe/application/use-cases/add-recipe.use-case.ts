import { CreateRecipeDto } from '../../recipe.dto';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { RecipeService } from '../../domain/services/recipe.service';
import { DishNotFoundError, DishRecipeExistsError, NotDishAuthorError } from '../../../../errors/domain';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { ForbiddenException } from '../../../../exceptions/forbidden-exception';
import { LoggerService } from '../../../logger/logger.service';
import { Recipe } from '../../domain/entities';
import { DishRecipeCacheService } from '../../../cache/dish-recipe/dish-recipe-cache.service';
import { EncodedDishId } from '../../../dish/encoded-dish-id.value-object';
import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';

export class AddRecipeUseCase extends AbstractUseCase<[EncodedDishId, CreateRecipeDto, UserAccessTokenPayload], Recipe> {

    constructor(
        private readonly recipeService: RecipeService,
        private readonly loggerService: LoggerService,
        private readonly dishRecipeCacheService: DishRecipeCacheService
    ) {
        super();
    }

    async execute(encodedDishId: EncodedDishId, createRecipeDto: CreateRecipeDto, userDto: UserAccessTokenPayload): Promise<Recipe> {
        const context = 'AddRecipeUseCase/execute';

        try {
            const recipe = await this.recipeService.create(encodedDishId, createRecipeDto, userDto);

            await this.dishRecipeCacheService.setDishRecipe(encodedDishId, recipe);

            this.loggerService.info(context, `New recipe has been created for dish "${recipe.dishId}"`);

            return recipe;
        } catch (err: unknown) {
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