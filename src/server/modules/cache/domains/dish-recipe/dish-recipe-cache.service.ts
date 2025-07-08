import { Inject, Injectable } from '@nestjs/common';
import { CACHE_PROVIDER } from '../../cache.constant';
import { Language } from '../../../../common/types';
import { HOUR } from '../../../../constants/times.constant';
import { DishRecipeKey } from './dish-recipe-cache.types';
import { DishRecipeCacheKeyFactory } from './dish-recipe-cache-key.factory';
import { DishRecipe } from '../../../recipe/application/recipe-application.types';
import { RecipeEntity } from '../../../recipe/domain/entities';
import { EncodedDishIdVo } from '../../../dish/domain/common/vos';
import { CacheClient } from '../../interfaces';

@Injectable()
export class DishRecipeCacheService {

    constructor(
        @Inject(CACHE_PROVIDER) private readonly cacheClient: CacheClient
    ) {}

    /**
     * @description Returns cached dish recipe or null value
     * @param encodedDishId encoded dish ID and its provider name
     * @param language recipe language
     */
    async getDishRecipe(encodedDishId: EncodedDishIdVo, language: Language): Promise<RecipeEntity | null> {
        const key: DishRecipeKey = DishRecipeCacheKeyFactory.createDishRecipeKey(encodedDishId, language);
        const value = await this.cacheClient.get(key);

        if (!value) {
            return null;
        }

        return <RecipeEntity>JSON.parse(value);
    }

    /**
     * @description Caches dish recipe
     * @param encodedDishId encoded dish ID and its provider name
     * @param recipe object representing recipe
     */
    async setDishRecipe(encodedDishId: EncodedDishIdVo, recipe: DishRecipe | RecipeEntity): Promise<void> {
        const key: DishRecipeKey = DishRecipeCacheKeyFactory.createDishRecipeKey(encodedDishId, recipe.language);
        const value = JSON.stringify(recipe);

        await this.cacheClient.set(key, value);
        await this.cacheClient.expire(key, 24 * HOUR);
    }

}
