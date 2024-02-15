import { Module } from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [
        RedisModule
    ],
    providers: [IngredientService],
})
export class IngredientModule {}
