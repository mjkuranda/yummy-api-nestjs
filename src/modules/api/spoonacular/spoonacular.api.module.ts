import { Module } from '@nestjs/common';
import { RedisModule } from '../../redis/redis.module';
import { SpoonacularApiService } from './spoonacular.api.service';
import { LoggerModule } from '../../logger/logger.module';
import { AxiosService } from '../../../services/axios.service';

@Module({
    imports: [
        RedisModule,
        LoggerModule
    ],
    providers: [SpoonacularApiService, AxiosService],
    exports: [SpoonacularApiService, AxiosService]
})
export class SpoonacularApiModule {}
