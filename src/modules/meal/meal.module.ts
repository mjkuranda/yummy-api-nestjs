import { Module } from '@nestjs/common';
import { MealService } from './meal.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MealController } from './meal.controller';
import { MEAL_MODEL } from '../../constants/models.constant';
import { RedisModule } from '../redis/redis.module';
import { MealRepository } from '../../mongodb/repositories/meal.repository';

@Module({
    imports: [
        MongooseModule.forFeature([MEAL_MODEL]),
        RedisModule
    ],
    controllers: [MealController],
    providers: [MealService, MealRepository],
})
export class MealModule {}
