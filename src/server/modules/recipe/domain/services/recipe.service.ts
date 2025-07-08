import { Injectable } from '@nestjs/common';
import { Language } from '../../../../common/types';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { ProviderRegistryService } from '../../../provider-registry/provider-registry.service';
import { DishRecipeCacheService } from '../../../cache/domains/dish-recipe/dish-recipe-cache.service';
import { DishNotFoundError, NotDishAuthorError, DishRecipeExistsError, DishRecipeNotFoundError } from '../../../dish/domain/errors';
import { GetRecipeResult } from '../../application/recipe-application.types';
import { EncodedDishIdVo } from '../../../dish/domain/common/vos';
import { RecipeEntity } from '../entities';
import { TranslationService } from '../../../translation/translation.service';
import { CreateRecipeDto } from '../../application/dtos';
import { DishDataManageable, RecipeDataManageable } from '../../../provider-registry/data-manageable.interface';

@Injectable()
export class RecipeService {

    private readonly dishApiService: DishDataManageable;
    private readonly recipeApiService: RecipeDataManageable;

    constructor(
        private readonly providerRegistryService: ProviderRegistryService,
        private readonly dishRecipeCacheService: DishRecipeCacheService,
        private readonly translationService: TranslationService
    ) {
        this.dishApiService = this.providerRegistryService.getDishApiService();
        this.recipeApiService = this.providerRegistryService.getRecipeApiService();
    }

    /**
     * @description creates a new dish recipe
     * @param encodedDishId encoded dish ID and its provider name
     * @param createRecipeDto data containing recipe information
     * @param user user data extracted from access token
     */
    async create(encodedDishId: EncodedDishIdVo, createRecipeDto: CreateRecipeDto, user: UserAccessTokenPayload): Promise<RecipeEntity> {
        const dishId = encodedDishId.getDishId();

        // NOTE: This dish can be unconfirmed because you add dish and recipe at once.
        const dish = await this.dishApiService.findByDishId(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        if (!user.isAdmin && dish.getAuthor() !== user.login) {
            throw new NotDishAuthorError();
        }

        const recipe = await this.recipeApiService.findRecipeByDishId(dishId);

        if (recipe) {
            throw new DishRecipeExistsError(encodedDishId);
        }

        const createdRecipe = await this.recipeApiService.createRecipe(createRecipeDto);

        const newRecipe = new RecipeEntity(
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
    async getTranslatedRecipe(encodedDishId: EncodedDishIdVo, language?: Language): Promise<GetRecipeResult> {
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

        const recipe = new RecipeEntity(dishRecipe.language, dishRecipe.dishId, dishRecipe.sections);

        const { translated: translatedRecipe } = await this.translationService.translateRecipe(recipe, language);

        await this.dishRecipeCacheService.setDishRecipe(encodedDishId, recipe);
        await this.dishRecipeCacheService.setDishRecipe(encodedDishId, translatedRecipe);

        return { recipe: translatedRecipe };
    }

}