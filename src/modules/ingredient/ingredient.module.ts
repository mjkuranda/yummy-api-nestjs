import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { IngredientSchema } from './ingredient.schema';
import { IngredientController } from './ingredient.controller';
import { IngredientService } from './ingredient.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { UserSchema } from '../user/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: models.INGREDIENT_MODEL, schema: IngredientSchema },
            { name: models.USER_MODEL, schema: UserSchema }
        ]),
        JwtModule.register({ secret: process.env.ACCESS_TOKEN_SECRET }),
        UserModule
    ],
    controllers: [IngredientController],
    providers: [IngredientService, UserService],
})
export class IngredientModule {}
