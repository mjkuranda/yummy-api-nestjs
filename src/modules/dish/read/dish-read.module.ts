import { Module } from '@nestjs/common';
import { ProviderModule } from '../../provider/provider.module';
import { DishReadService } from './dish-read.service';
import { CacheModule } from '../../cache/cache.module';
import { LoggerModule } from '../../logger/logger.module';
import { DishAggregatorService } from './dish-aggregator.service';

@Module({
    imports: [ProviderModule, CacheModule, LoggerModule],
    providers: [DishReadService, DishAggregatorService],
    exports: [DishReadService]
})
export class DishReadModule {}