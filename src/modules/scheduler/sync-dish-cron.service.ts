import { Injectable } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';
import { DishCacheService } from '../cache/dish/dish-cache.service';
import { LoggerService } from '../logger/logger.service';
import { ContextString } from '../../common/types';
import { ProviderRegistryService } from '../provider/provider-registry.service';

@Injectable()
export class SyncDishCronService {
    constructor(
        private readonly providerRegistryService: ProviderRegistryService,
        private readonly dishCacheService: DishCacheService,
        private readonly loggerService: LoggerService
    ) {}

    // @Cron('0 2 * * *')
    async refreshDishCache() {
        const context: ContextString = 'SyncDishCronService/refreshDishCache';
        // TODO: Ingredient list!!!
        const ingredients: string[] = [];

        this.loggerService.info(context, 'Starting refreshing dish cache...');

        for (const provider of this.providerRegistryService.getAllProviders()) {
            this.loggerService.info(context, `Fetching dishes for provider: ${provider.getProvider()}`);

            for (const ingredient of ingredients) {
                try {
                    const dishes = await provider.getDishes([ingredient]);

                    this.loggerService.info(context, `Fetched ${dishes.length} dishes for "${provider.getProvider()}" provider and "${ingredient}" ingredient.`);

                    await this.dishCacheService.setDishesPerIngredient(provider, ingredient, dishes);
                } catch (err) {
                    this.loggerService.error(context, `Fetch failed for "${provider.getProvider()}" provider and "${ingredient}" ingredient.`);
                }
            }
        }

        this.loggerService.info(context, 'Refreshing dish cache finished.');
    }
}
