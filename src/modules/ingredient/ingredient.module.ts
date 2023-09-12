import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { IngredientSchema } from './ingredient.schema';
import { IngredientController } from './ingredient.controller';
import { IngredientService } from './ingredient.service';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: models.INGREDIENT_MODEL, schema: IngredientSchema }
        ]),
        RedisModule
    ],
    controllers: [IngredientController],
    providers: [IngredientService],
})
export class IngredientModule {}
