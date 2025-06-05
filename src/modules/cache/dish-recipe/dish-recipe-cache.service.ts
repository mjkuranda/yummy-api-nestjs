import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from '../../redis/redis.constants';
import { Redis } from 'ioredis';
import { EncodedDishId, Language } from '../../../common/types';
import { DishRecipe } from '../../recipe/recipe.types';
import { HOUR } from '../../../constants/times.constant';
import { DishRecipeKey } from './dish-recipe-cache.types';
import { DishRecipeCacheKeyFactory } from './dish-recipe-cache-key.factory';

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
    async getDishRecipe(encodedDishId: EncodedDishId, language: Language): Promise<DishRecipe | null> {
        const key: DishRecipeKey = DishRecipeCacheKeyFactory.createDishRecipeKey(encodedDishId, language);
        const value = await this.redisClient.get(key);

        if (!value) {
            return null;
        }

        return <DishRecipe>JSON.parse(value);
    }

    /**
     * @description Caches dish recipe
     * @param recipe object representing recipe
     */
    async setDishRecipe(recipe: DishRecipe): Promise<void> {
        const key: DishRecipeKey = DishRecipeCacheKeyFactory.createDishRecipeKey(recipe.dishId, recipe.language);
        const value = JSON.stringify(recipe);

        await this.redisClient.set(key, value);
        await this.redisClient.expire(key, 24 * HOUR);
    }

}
