import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MealModule } from './modules/meal/meal.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMongooseUri } from './utils';
import { IngredientModule } from './modules/ingredient/ingredient.module';
import { UserModule } from './modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env'],
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async () => ({
                uri: getMongooseUri(),
            }),
            inject: [ConfigService],
        }),
        JwtModule.register({ secret: process.env.ACCESS_TOKEN_SECRET }),
        IngredientModule,
        MealModule,
        UserModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
