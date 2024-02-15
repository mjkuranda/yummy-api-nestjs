import { Module } from '@nestjs/common';
import { MealService } from './meal.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MealController } from './meal.controller';
import { MEAL_MODEL } from '../../constants/models.constant';
import { RedisModule } from '../redis/redis.module';
import { MealRepository } from '../../mongodb/repositories/meal.repository';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { SpoonacularApiModule } from '../api/spoonacular/spoonacular.api.module';
import { IngredientModule } from '../ingredient/ingredient.module';

@Module({
    imports: [
        MongooseModule.forFeature([MEAL_MODEL]),
        RedisModule,
        JwtManagerModule,
        IngredientModule,
        SpoonacularApiModule
    ],
    controllers: [MealController],
    providers: [MealService, MealRepository, JwtManagerService],
})
export class MealModule {}
