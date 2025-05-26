import { Module } from '@nestjs/common';
import { DishSourceModule } from '../source/dish-source.module';
import { DishWriteService } from './dish-write.service';
import { CacheModule } from '../../cache/cache.module';
import { LoggerModule } from '../../logger/logger.module';

@Module({
    imports: [DishSourceModule, CacheModule, LoggerModule],
    providers: [DishWriteService],
    exports: [DishWriteService]
})
export class DishWriteModule {}