import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { CacheProvider } from './cache.provider';
import { DishCacheService } from './domains/dish/dish-cache.service';
import { DishRecipeCacheService } from './domains/dish-recipe/dish-recipe-cache.service';
import { UserCacheService } from './domains/user/user-cache.service';
import { CACHE_PROVIDER } from './cache.constant';
import { CacheClient } from './interfaces/cache-client.interface';
import { LoggerService } from '../logger/logger.service';
import { ContextString } from '../../common/types';

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
export class CacheModule implements OnModuleDestroy {

    constructor(
        @Inject(CACHE_PROVIDER) private readonly cacheClient: CacheClient,
        private readonly loggerService: LoggerService
    ) {}

    async onModuleDestroy(): Promise<void> {
        const context: ContextString = 'CacheModule/onModuleDestroy';

        try {
            await this.cacheClient.disconnect();

            this.loggerService.info(context, 'Cache has been successfully disconnected.');
        } catch (err) {
            this.loggerService.error(context, `Cache disconnection failed. ${err.message}.`);
        }
    }

}