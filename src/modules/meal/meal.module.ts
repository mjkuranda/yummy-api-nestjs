import { Module } from '@nestjs/common';
import { MealService } from './meal.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MealSchema } from './meal.schema';
import { MealController } from './meal.controller';
import { models } from '../../constants/models.constant';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserSchema } from '../user/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: models.MEAL_MODEL, schema: MealSchema },
            { name: models.USER_MODEL, schema: UserSchema }
        ]),
        AuthModule
    ],
    controllers: [MealController],
    providers: [MealService, AuthService, JwtService, UserService],
})
export class MealModule {}
