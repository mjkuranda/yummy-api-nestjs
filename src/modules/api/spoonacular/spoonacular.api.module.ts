import { Module } from '@nestjs/common';
import { RedisModule } from '../../redis/redis.module';
import { SpoonacularApiService } from './spoonacular.api.service';
import { LoggerModule } from '../../logger/logger.module';

@Module({
    imports: [
        RedisModule,
        LoggerModule
    ],
    providers: [SpoonacularApiService],
    exports: [SpoonacularApiService]
})
export class SpoonacularApiModule {}
