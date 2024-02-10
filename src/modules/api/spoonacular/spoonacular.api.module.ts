import { Module } from '@nestjs/common';
import { RedisModule } from '../../redis/redis.module';
import { SpoonacularApiService } from './spoonacular.api.service';

@Module({
    imports: [
        RedisModule,
    ],
    providers: [SpoonacularApiService],
    exports: [SpoonacularApiService]
})
export class SpoonacularApiModule {}
