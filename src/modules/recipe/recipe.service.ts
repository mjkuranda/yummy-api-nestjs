import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { DishRecipeRepository } from '../../mongodb/repositories/dish-recipe.repository';
import { CreateRecipeDto } from './recipe.dto';
import { DishRecipeDocument } from '../../mongodb/documents/dish-recipe-document';
import { ContextString, Language } from '../../common/types';
import { UserAccessTokenPayload } from '../jwt-manager/jwt-manager.types';
import { DishRecipe } from './recipe.types';
import { DetailedDish } from '../dish/dish.types';
import { DishSourceRegistryService } from '../dish/source/dish-source-registry.service';
import { DishRepository } from '../../mongodb/repositories/dish.repository';
import { DishCacheService } from '../cache/dish/dish-cache.service';
import { DishRecipeCacheService } from '../cache/dish-recipe/dish-recipe-cache.service';
import { DishNotFoundError, NotDishAuthorError, DishRecipeExistsError, DishRecipeNotFoundError } from '../../errors/domain';

@Injectable()
export class RecipeService {

    private readonly dishRepository: DishRepository;

    constructor(
        private readonly dishSourceRegistryService: DishSourceRegistryService,
        private readonly recipeRepository: DishRecipeRepository,
        private readonly loggerService: LoggerService,
        private readonly dishCacheService: DishCacheService,
        private readonly dishRecipeCacheService: DishRecipeCacheService
    ) {
        this.dishRepository = this.dishSourceRegistryService.getDishRepositoryProvider();
    }

    /**
     * @description creates a new dish recipe
     * @param dishId dish id
     * @param createRecipeDto data containing recipe information
     * @param user user data extracted from access token
     */
    async create(dishId: string, createRecipeDto: CreateRecipeDto, user: UserAccessTokenPayload): Promise<DishRecipeDocument> {
        const context: ContextString = 'RecipeService/create';

        // NOTE: This dish can be unconfirmed because you add dish and recipe at once.
        const dish = await this.dishRepository.findById(dishId);

        if (!dish) {
            const message = 'Dish does not exist';

            this.loggerService.error(context, message);

            throw new DishNotFoundError(dishId);
        }

        if (!user.isAdmin && dish.author !== user.login) {
            const message = 'You must be an author the dish to apply a recipe';

            this.loggerService.error(context, message);

            throw new NotDishAuthorError();
        }

        const recipe = await this.recipeRepository.findByDishId(dishId);

        if (recipe) {
            const message = `Recipe "${recipe._id}" already exists for this specific dish "${dish._id}"`;
            this.loggerService.error(context, message);

            throw new DishRecipeExistsError(dishId, recipe._id);
        }

        const createdRecipe = await this.recipeRepository.create(createRecipeDto);
        this.loggerService.info(context, `New recipe "${createdRecipe._id}" created for dish "${dish.id}"`);

        return createdRecipe;
    }

    /**
     * @description returns existing recipe
     * @param dishId dish ID
     * @param language dish recipe language
     */
    async get(dishId: string, language: Language): Promise<DishRecipe> {
        const context: ContextString = 'RecipeService/get';
        const cachedRecipe = await this.dishRecipeCacheService.getDishRecipe(dishId, language);

        if (cachedRecipe) {
            const message = `Found recipe in cache for dish "${dishId}"`;
            this.loggerService.info(context, message);

            return cachedRecipe;
        }

        const cachedDish = await this.dishCacheService.getDishDetails(dishId);
        const dish = cachedDish ?? await this.dishRepository.findById(dishId);

        if (!dish) {
            throw new DishNotFoundError(dishId);
        }

        // NOTE: To avoid leaking of daily points from external API, I cache dish result
        await this.dishCacheService.setDishDetails(dishId, dish as DetailedDish);

        // TODO: Find recipe using dishSourceRegistryService
        const recipe = await this.recipeRepository.findByDishId(dishId, language);

        if (!recipe) {
            const message = `Recipe for "${dishId}" dish has not been found`;
            this.loggerService.error(context, message);

            throw new DishRecipeNotFoundError(dishId);
        }

        return recipe;
    }
}