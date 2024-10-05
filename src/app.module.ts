import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DishModule } from './modules/dish/dish.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { getMongooseUri } from './utils';
import { IngredientModule } from './modules/ingredient/ingredient.module';
import { UserModule } from './modules/user/user.module';
import { LoggerModule } from './modules/logger/logger.module';
import { ImageModule } from './modules/image/image.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env'],
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async () => ({
                uri: getMongooseUri()
            }),
            inject: [ConfigService],
        }),
        ServeStaticModule.forRoot(
            {
                rootPath: join(__dirname, '..', 'data/images/dishes'),
                serveRoot: '/images/dishes',
            },
            {
                rootPath: join(__dirname, '..', 'data/ingredients'),
                serveRoot: '/ingredients'
            }
        ),
        LoggerModule,
        IngredientModule,
        DishModule,
        UserModule,
        ImageModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule implements NestModule {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configure(consumer: MiddlewareConsumer) {}
}
