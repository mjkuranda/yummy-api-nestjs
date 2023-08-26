import { Module } from '@nestjs/common';
import { MealService } from './meal.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MealSchema } from './meal.schema';
import { MealController } from './meal.controller';
import { models } from '../../constants/models.constant';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { UserSchema } from '../user/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: models.MEAL_MODEL, schema: MealSchema },
            { name: models.USER_MODEL, schema: UserSchema }
        ]),
        JwtModule.register({ secret: process.env.ACCESS_TOKEN_SECRET }),
        UserModule
    ],
    controllers: [MealController],
    providers: [MealService, UserService],
})
export class MealModule {}
