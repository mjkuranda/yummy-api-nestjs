import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { RecipeRepository } from '../../mongodb/repositories/recipe.repository';
import { CreateRecipeDto } from './recipe.dto';
import { DishRepository } from '../../mongodb/repositories/dish.repository';
import { RecipeDocument } from '../../mongodb/documents/recipe.document';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { ContextString } from '../../common/types';
import { TransformedBody } from '../../common/interfaces';
import { ForbiddenException } from '../../exceptions/forbidden-exception';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { UserAccessTokenPayload } from '../jwt-manager/jwt-manager.types';

@Injectable()
export class RecipeService {

    constructor(
        private readonly recipeRepository: RecipeRepository,
        private readonly dishRepository: DishRepository,
        private readonly loggerService: LoggerService
    ) {}

    async create(dishId: string, createRecipeDto: CreateRecipeDto, user: UserAccessTokenPayload): Promise<RecipeDocument> {
        const context: ContextString = 'RecipeService/create';

        const dish = await this.dishRepository.findOneAvailable(dishId);

        if (!dish) {
            const message = 'Dish does not exist';

            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        if (!user.isAdmin && dish.author !== user.login) {
            const message = 'You must be an author the dish to apply a recipe';

            this.loggerService.error(context, message);

            throw new ForbiddenException(context, message);
        }

        const recipe = await this.recipeRepository.findByDishId(dishId);

        if (recipe) {
            const message = `Recipe "${recipe._id}" already exists for this specific dish "${dish._id}"`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const createdRecipe = await this.recipeRepository.create(createRecipeDto);
        this.loggerService.info(context, `New recipe "${createdRecipe._id}" created for dish "${dish.id}".`);

        return createdRecipe;
    }
}