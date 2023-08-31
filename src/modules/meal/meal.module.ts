import { Module } from '@nestjs/common';
import { MealService } from './meal.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MealSchema } from './meal.schema';
import { MealController } from './meal.controller';
import { models } from '../../constants/models.constant';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: models.MEAL_MODEL, schema: MealSchema },
        ])
    ],
    controllers: [MealController],
    providers: [MealService],
})
export class MealModule {}
