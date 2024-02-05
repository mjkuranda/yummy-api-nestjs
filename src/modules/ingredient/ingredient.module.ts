import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { INGREDIENT_MODEL } from '../../constants/models.constant';
import { IngredientController } from './ingredient.controller';
import { IngredientService } from './ingredient.service';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [
        MongooseModule.forFeature([INGREDIENT_MODEL]),
        RedisModule
    ],
    controllers: [IngredientController],
    providers: [IngredientService],
})
export class IngredientModule {}
