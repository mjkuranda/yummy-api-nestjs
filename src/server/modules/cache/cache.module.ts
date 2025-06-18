import { Global, Module } from '@nestjs/common';
import { CacheProvider } from './cache.provider';
import { DishCacheService } from './dish/dish-cache.service';
import { DishRecipeCacheService } from './dish-recipe/dish-recipe-cache.service';
import { UserCacheService } from './user/user-cache.service';

@Global()
@Module({
    providers: [
        CacheProvider,
        DishCacheService,
        DishRecipeCacheService,
        UserCacheService
    ],
    exports: [
        CacheProvider,
        DishCacheService,
        DishRecipeCacheService,
        UserCacheService
    ]
})
export class CacheModule {}