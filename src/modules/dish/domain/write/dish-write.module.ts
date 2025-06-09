import { Module } from '@nestjs/common';
import { ProviderModule } from '../../../provider/provider.module';
import { DishWriteService } from './dish-write.service';
import { CacheModule } from '../../../cache/cache.module';
import { LoggerModule } from '../../../logger/logger.module';

@Module({
    imports: [ProviderModule, CacheModule, LoggerModule],
    providers: [DishWriteService],
    exports: [DishWriteService]
})
export class DishWriteModule {}