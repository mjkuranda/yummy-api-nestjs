import { Module } from '@nestjs/common';
import { DishSourceModule } from '../source/dish-source.module';
import { DishReadService } from './dish-read.service';
import { CacheModule } from '../../cache/cache.module';
import { LoggerModule } from '../../logger/logger.module';
import { DishAggregatorService } from './dish-aggregator.service';

@Module({
    imports: [DishSourceModule, CacheModule, LoggerModule],
    providers: [DishReadService, DishAggregatorService],
    exports: [DishReadService]
})
export class DishReadModule {}