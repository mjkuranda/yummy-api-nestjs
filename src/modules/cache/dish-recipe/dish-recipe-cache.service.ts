import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from '../../redis/redis.constants';
import { Redis } from 'ioredis';
import { Language } from '../../../common/types';
import { HOUR } from '../../../constants/times.constant';
import { DishRecipeKey } from './dish-recipe-cache.types';
import { DishRecipeCacheKeyFactory } from './dish-recipe-cache-key.factory';
import { DishRecipe } from '../../recipe/application/recipe-application.types';
import { Recipe } from '../../recipe/domain/entities';
import { EncodedDishId } from '../../dish/encoded-dish-id.value-object';

@Injectable()
export class DishRecipeCacheService {

    constructor(
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis
    ) {}

    /**
     * @description Returns cached dish recipe or null value
     * @param encodedDishId encoded dish ID and its provider name
     * @param language recipe language
     */
    async getDishRecipe(encodedDishId: EncodedDishId, language: Language): Promise<Recipe | null> {
        const key: DishRecipeKey = DishRecipeCacheKeyFactory.createDishRecipeKey(encodedDishId, language);
        const value = await this.redisClient.get(key);

        if (!value) {
            return null;
        }

        return <Recipe>JSON.parse(value);
    }

    /**
     * @description Caches dish recipe
     * @param encodedDishId encoded dish ID and its provider name
     * @param recipe object representing recipe
     */
    async setDishRecipe(encodedDishId: EncodedDishId, recipe: DishRecipe | Recipe): Promise<void> {
        const key: DishRecipeKey = DishRecipeCacheKeyFactory.createDishRecipeKey(encodedDishId, recipe.language);
        const value = JSON.stringify(recipe);

        await this.redisClient.set(key, value);
        await this.redisClient.expire(key, 24 * HOUR);
    }

}
