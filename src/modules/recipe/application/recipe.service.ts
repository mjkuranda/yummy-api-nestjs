import { Injectable } from '@nestjs/common';
import { DishRecipeRepository } from '../../../mongodb/repositories/dish-recipe.repository';
import { CreateRecipeDto } from '../recipe.dto';
import { DishRecipeDocument } from '../../../mongodb/documents/dish-recipe-document';
import { EncodedDishId, Language } from '../../../common/types';
import { UserAccessTokenPayload } from '../../jwt-manager/jwt-manager.types';
import { DetailedDish } from '../../dish/dish.types';
import { ProviderRegistryService } from '../../provider/provider-registry.service';
import { DishRepository } from '../../../mongodb/repositories/dish.repository';
import { DishCacheService } from '../../cache/dish/dish-cache.service';
import { DishRecipeCacheService } from '../../cache/dish-recipe/dish-recipe-cache.service';
import { DishNotFoundError, NotDishAuthorError, DishRecipeExistsError, DishRecipeNotFoundError } from '../../../errors/domain';
import { GetRecipeResult } from './recipe-application.types';
import { DishIdObfuscator } from '../../../common/helpers/dish-id-obfuscator.helper';

@Injectable()
export class RecipeService {

    private readonly dishRepository: DishRepository;
    private readonly recipeRepository: DishRecipeRepository;

    constructor(
        private readonly providerRegistryService: ProviderRegistryService,
        private readonly dishCacheService: DishCacheService,
        private readonly dishRecipeCacheService: DishRecipeCacheService
    ) {
        this.dishRepository = this.providerRegistryService.getDishRepository();
        this.recipeRepository = this.providerRegistryService.getRecipeRepository();
    }

    /**
     * @description creates a new dish recipe
     * @param encodedDishId encoded dish ID and its provider name
     * @param createRecipeDto data containing recipe information
     * @param user user data extracted from access token
     */
    async create(encodedDishId: EncodedDishId, createRecipeDto: CreateRecipeDto, user: UserAccessTokenPayload): Promise<DishRecipeDocument> {
        const { dishId } = DishIdObfuscator.decode(encodedDishId);

        // NOTE: This dish can be unconfirmed because you add dish and recipe at once.
        const dish = await this.dishRepository.findById(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        if (!user.isAdmin && dish.author !== user.login) {
            throw new NotDishAuthorError();
        }

        const recipe = await this.recipeRepository.findByDishId(encodedDishId);

        if (recipe) {
            throw new DishRecipeExistsError(encodedDishId, recipe._id);
        }

        const createdRecipe = await this.recipeRepository.create(createRecipeDto);

        return createdRecipe;
    }

    /**
     * @description returns existing recipe
     * @param encodedDishId encoded dish ID and its provider name
     * @param language dish recipe language
     */
    async get(encodedDishId: EncodedDishId, language?: Language): Promise<GetRecipeResult> {
        const { providerName } = DishIdObfuscator.decode(encodedDishId);
        const providable = this.providerRegistryService.getProvider(providerName);

        const recipeLanguage = language ?? providable.getLanguage(encodedDishId);
        const cachedRecipe = await this.dishRecipeCacheService.getDishRecipe(encodedDishId, recipeLanguage);

        if (cachedRecipe) {
            return {
                recipe: cachedRecipe,
                fromCache: true
            };
        }

        const cachedDish = await this.dishCacheService.getDishDetails(encodedDishId);
        const dish = cachedDish ?? await providable.getDishDetails(encodedDishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        // NOTE: To avoid leaking of daily points from external API, I cache dish result
        await this.dishCacheService.setDishDetails(encodedDishId, dish as DetailedDish);

        const recipe = await providable.getDishRecipe(encodedDishId, language);

        if (!recipe) {
            throw new DishRecipeNotFoundError(encodedDishId);
        }

        return { recipe };
    }
}