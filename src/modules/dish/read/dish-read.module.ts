import { Module } from '@nestjs/common';
import { DishSourceModule } from '../source/dish-source.module';
import { DishReadService } from './dish-read.service';
import { RedisModule } from '../../redis/redis.module';
import { LoggerModule } from '../../logger/logger.module';
import { DishAggregatorService } from './dish-aggregator.service';

@Module({
    imports: [DishSourceModule, RedisModule, LoggerModule],
    providers: [DishReadService, DishAggregatorService],
    exports: [DishReadService]
})
export class DishReadModule {}