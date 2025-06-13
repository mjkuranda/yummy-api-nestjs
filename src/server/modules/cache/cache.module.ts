import { Module } from '@nestjs/common';
import { CacheProvider } from './cache.provider';
import { DishCacheService } from './dish/dish-cache.service';
import { DishRecipeCacheService } from './dish-recipe/dish-recipe-cache.service';

@Module({
    providers: [
        CacheProvider,
        DishCacheService,
        DishRecipeCacheService
    ],
    exports: [CacheProvider, DishCacheService, DishRecipeCacheService]
})
export class CacheModule {}