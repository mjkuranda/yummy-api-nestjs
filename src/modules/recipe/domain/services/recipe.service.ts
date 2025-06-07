import { Injectable } from '@nestjs/common';
import { DishRecipeRepository } from '../../../../mongodb/repositories/dish-recipe.repository';
import { CreateRecipeDto } from '../../recipe.dto';
import { Language } from '../../../../common/types';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { ProviderRegistryService } from '../../../provider/provider-registry.service';
import { DishRepository } from '../../../../mongodb/repositories/dish.repository';
import { DishRecipeCacheService } from '../../../cache/dish-recipe/dish-recipe-cache.service';
import { DishNotFoundError, NotDishAuthorError, DishRecipeExistsError, DishRecipeNotFoundError } from '../../../../errors/domain';
import { GetRecipeResult } from '../../application/recipe-application.types';
import { EncodedDishId } from '../../../dish/encoded-dish-id.value-object';
import { Recipe } from '../entities';
import { TranslationService } from '../../../translation/translation.service';

@Injectable()
export class RecipeService {

    private readonly dishRepository: DishRepository;
    private readonly recipeRepository: DishRecipeRepository;

    constructor(
        private readonly providerRegistryService: ProviderRegistryService,
        private readonly dishRecipeCacheService: DishRecipeCacheService,
        private readonly translationService: TranslationService
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
    async create(encodedDishId: EncodedDishId, createRecipeDto: CreateRecipeDto, user: UserAccessTokenPayload): Promise<Recipe> {
        const dishId = encodedDishId.getDishId();

        // NOTE: This dish can be unconfirmed because you add dish and recipe at once.
        const dish = await this.dishRepository.findById(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        if (!user.isAdmin && dish.author !== user.login) {
            throw new NotDishAuthorError();
        }

        const recipe = await this.recipeRepository.findByDishId(dishId);

        if (recipe) {
            throw new DishRecipeExistsError(encodedDishId);
        }

        const createdRecipe = await this.recipeRepository.create(createRecipeDto);

        const newRecipe = new Recipe(
            createdRecipe.language,
            createdRecipe.dishId,
            createdRecipe.sections
        );

        await this.dishRecipeCacheService.setDishRecipe(encodedDishId, recipe);

        return newRecipe;
    }

    /**
     * @description returns existing recipe
     * @param encodedDishId encoded dish ID and its provider name
     * @param language dish recipe language
     */
    async getTranslatedRecipe(encodedDishId: EncodedDishId, language?: Language): Promise<GetRecipeResult> {
        const provider = encodedDishId.getProvider();
        const providable = this.providerRegistryService.getProvider(provider);

        const recipeLanguage = language ?? providable.getLanguage(encodedDishId);
        const cachedRecipe = await this.dishRecipeCacheService.getDishRecipe(encodedDishId, recipeLanguage);

        if (cachedRecipe) {
            return {
                recipe: cachedRecipe,
                fromCache: true
            };
        }

        const dishRecipe = await providable.getDishRecipe(encodedDishId, language);

        if (!dishRecipe) {
            throw new DishRecipeNotFoundError(encodedDishId);
        }

        const recipe = new Recipe(dishRecipe.language, dishRecipe.dishId, dishRecipe.sections);

        const { translated: translatedRecipe } = await this.translationService.translateRecipe(recipe, language);

        await this.dishRecipeCacheService.setDishRecipe(encodedDishId, recipe);
        await this.dishRecipeCacheService.setDishRecipe(encodedDishId, translatedRecipe);

        return { recipe: translatedRecipe };
    }

}