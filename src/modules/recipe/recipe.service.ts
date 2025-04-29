import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { RecipeRepository } from '../../mongodb/repositories/recipe.repository';
import { CreateRecipeDto } from './recipe.dto';
import { DishRepository } from '../../mongodb/repositories/dish.repository';
import { RecipeDocument } from '../../mongodb/documents/recipe.document';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { ContextString } from '../../common/types';
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

        // NOTE: This dish can be unconfirmed because you add dish and recipe at once.
        const dish = await this.dishRepository.findById(dishId);

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
        this.loggerService.info(context, `New recipe "${createdRecipe._id}" created for dish "${dish.id}"`);

        return createdRecipe;
    }

    async get(dishId: string): Promise<RecipeDocument> {
        const context: ContextString = 'RecipeService/get';
        const dish = await this.dishRepository.findById(dishId);

        if (!dish) {
            const message = `Not found any dish with "${dishId}" provided id`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const recipe = await this.recipeRepository.findByDishId(dishId);

        if (!recipe) {
            const message = `Recipe for "${dishId}" dish has not been found`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        return recipe;
    }
}