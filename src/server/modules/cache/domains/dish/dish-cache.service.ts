import { Inject, Injectable } from '@nestjs/common';
import { CACHE_PROVIDER } from '../../cache.constant';
import { Providable } from '../../../../common/interfaces';
import { DishCacheKeyFactory } from './dish-cache-key.factory';
import { DAY, HOUR } from '../../../../constants/times.constant';
import { EncodedDishIdVo } from '../../../dish/domain/common/vos';
import { DishDetailsVo, DishResultVo } from '../../../dish/domain/read/vos';
import { CacheClient } from '../../interfaces';

@Injectable()
export class DishCacheService {

    constructor(
        @Inject(CACHE_PROVIDER) private readonly cacheClient: CacheClient
    ) {}

    /**
     * @description Returns all cached dishes per search query
     * @param providedIngredients list of provided ingredients by user
     */
    async getDishes(providedIngredients: string[]): Promise<DishResultVo[]> {
        const key = DishCacheKeyFactory.createDishSearchResultKey(providedIngredients);
        const val = await this.cacheClient.get(key);

        return val ? <DishResultVo[]>JSON.parse(val) : [];
    }

    /**
     * @description Saves all dishes found by query, where provided ingredients were included in
     * @param providedIngredients list of provided ingredients by user
     * @param dishResults received results from query
     */
    async setDishes(providedIngredients: string[], dishResults: DishResultVo[]): Promise<void> {
        const key = DishCacheKeyFactory.createDishSearchResultKey(providedIngredients);
        const val = JSON.stringify(dishResults);

        await this.cacheClient.set(key, val);
        await this.cacheClient.expire(key, 12 * HOUR);
    }

    /**
     * @description Returns all accumulated dishes from every listed ingredient and a particular provider
     * @param provider defined provider of the dishes
     * @param ingredients list of ingredients to merge results
     */
    async getDishesPerIngredient(provider: Providable, ingredients: string[]): Promise<DishResultVo[]> {
        if (ingredients.length === 0) {
            return [];
        }

        const key = DishCacheKeyFactory.createDishSearchResultPerProviderKey(provider);
        const pipeline = this.cacheClient.createPipeline();
        ingredients.forEach(ingredient => pipeline.hget(key, ingredient));
        const results = await pipeline.execute();

        return results.flatMap(([err, val]) => {
            if (err || !val) {
                return [];
            }

            if (typeof val !== 'string') {
                return [];
            }

            try {
                return JSON.parse(val) as DishResultVo[];
            } catch {
                return [];
            }
        });
    }

    /**
     * @description Saves dishes to cache, defined for a particular provider and ingredient
     * @param provider
     * @param ingredient
     * @param dishes
     */
    async setDishesPerIngredient(provider: Providable, ingredient: string, dishes: DishResultVo[]): Promise<void> {
        const key = DishCacheKeyFactory.createDishSearchResultPerProviderKey(provider);

        await this.cacheClient.hset(key, ingredient, JSON.stringify(dishes));
        await this.cacheClient.expire(key, 365 * DAY);
    }

    /**
     * @description Gets detailed dish from cache
     * @param encodedDishId dish ID
     */
    async getDishDetails(encodedDishId: EncodedDishIdVo): Promise<DishDetailsVo | null> {
        const key = DishCacheKeyFactory.createDishDetailedResultKey(encodedDishId);
        const val = await this.cacheClient.get(key);

        return val ? <DishDetailsVo>JSON.parse(val) : null;
    }

    /**
     * @description Saves detailed dish to the cache
     * @param encodedDishId encoded dish ID and its cache
     * @param dishDetails dish to cache
     * @returns void
     */
    async setDishDetails(encodedDishId: EncodedDishIdVo, dishDetails: DishDetailsVo): Promise<void> {
        const key = DishCacheKeyFactory.createDishDetailedResultKey(encodedDishId);

        await this.cacheClient.set(key, JSON.stringify(dishDetails));
        await this.cacheClient.expire(key, DAY);
    }

    /**
     * @description Returns true if dish with a particular encoded ID is cached
     * @param encodedDishId encoded dish ID and its provider name
     */
    async hasDish(encodedDishId: EncodedDishIdVo): Promise<boolean> {
        const key = DishCacheKeyFactory.createDishDetailedResultKey(encodedDishId);
        const val = await this.cacheClient.get(key);

        return val !== null && val.length > 0;
    }

    /**
     * @description Deletes dish row from cache
     * @param encodedDishId encoded dish ID and its provider name
     */
    async deleteDish(encodedDishId: EncodedDishIdVo): Promise<void> {
        const key = DishCacheKeyFactory.createDishDetailedResultKey(encodedDishId);

        await this.cacheClient.del(key);
    }
}