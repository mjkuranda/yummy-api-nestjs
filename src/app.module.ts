import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MealModule } from './modules/meal/meal.module';
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
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'data/images/meals'),
            serveRoot: '/images/meals',
        }),
        LoggerModule,
        IngredientModule,
        MealModule,
        UserModule,
        ImageModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule implements NestModule {

    configure(consumer: MiddlewareConsumer) {
    //     consumer
    //         .apply(AuthorizeMiddleware)
    //         .forRoutes(
    //             { path: '/meals/create', method: RequestMethod.POST },
    //             { path: '/meals/:id', method: RequestMethod.PUT },
    //             { path: '/meals/:id', method: RequestMethod.DELETE },
    //             { path: '/ingredients/create', method: RequestMethod.POST }
    //         );
    //     consumer
    //         .apply(AuthenticateUserMiddleware)
    //         .forRoutes(
    //             { path: '/users/:login/grant/:capability', method: RequestMethod.POST },
    //             { path: '/users/:login/deny/:capability', method: RequestMethod.POST },
    //             { path: '/meals/:id/create', method: RequestMethod.POST },
    //             { path: '/meals/:id/edit', method: RequestMethod.POST },
    //             { path: '/meals/:id/delete', method: RequestMethod.POST }
    //         );
    //     consumer
    //         .apply(AuthorizeUserMiddleware)
    //         .forRoutes(
    //             { path: '/users/:login/grant/:capability', method: RequestMethod.POST },
    //             { path: '/users/:login/deny/:capability', method: RequestMethod.POST }
    //         );
    //     consumer
    //         .apply(AuthorizeUserActionMiddleware)
    //         .forRoutes(
    //             { path: '/meals/:id/create', method: RequestMethod.POST },
    //             { path: '/meals/:id/edit', method: RequestMethod.POST },
    //             { path: '/meals/:id/delete', method: RequestMethod.POST }
    //         );
    }
}
