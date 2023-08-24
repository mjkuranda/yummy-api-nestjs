import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MealModule } from './modules/meal/meal.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMongooseUri } from './utils';
import {IngredientModule} from './modules/ingredient/ingredient.module';

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
        IngredientModule,
        MealModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
