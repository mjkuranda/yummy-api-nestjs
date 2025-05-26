import { Module } from '@nestjs/common';
import { CacheProvider } from './cache.provider';
import { DishCacheService } from './dish-cache.service';

@Module({
    providers: [
        CacheProvider,
        DishCacheService
    ],
    exports: [CacheProvider, DishCacheService],
})
export class CacheModule {}