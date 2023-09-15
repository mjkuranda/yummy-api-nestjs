import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MealModule } from './modules/meal/meal.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMongooseUri } from './utils';
import { IngredientModule } from './modules/ingredient/ingredient.module';
import { UserModule } from './modules/user/user.module';
import { AuthorizeMiddleware } from './middleware/authorize.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerModule } from './modules/logger/logger.module';
import { AuthenticateUserMiddleware } from './middleware/authenticate-user.middleware';
import { AuthorizeUserMiddleware } from './middleware/authorize-user-middleware';
import { AuthorizeUserActionMiddleware } from './middleware/authorize-user-action.middleware';

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
        LoggerModule,
        IngredientModule,
        MealModule,
        UserModule,
        AuthModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule implements NestModule {

    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthorizeMiddleware)
            .forRoutes(
                { path: '/meals/create', method: RequestMethod.POST },
                { path: '/meals/:id', method: RequestMethod.PUT },
                { path: '/meals/:id', method: RequestMethod.DELETE },
                { path: '/ingredients/create', method: RequestMethod.POST }
            );
        consumer
            .apply(AuthenticateUserMiddleware)
            .forRoutes(
                { path: '/users/:login/grant/:capability', method: RequestMethod.POST },
                { path: '/users/:login/deny/:capability', method: RequestMethod.POST },
                { path: '/meals/:id/create', method: RequestMethod.POST },
                { path: '/meals/:id/edit', method: RequestMethod.POST },
                { path: '/meals/:id/delete', method: RequestMethod.POST }
            );
        consumer
            .apply(AuthorizeUserMiddleware)
            .forRoutes(
                { path: '/users/:login/grant/:capability', method: RequestMethod.POST },
                { path: '/users/:login/deny/:capability', method: RequestMethod.POST }
            );
        consumer
            .apply(AuthorizeUserActionMiddleware)
            .forRoutes(
                { path: '/meals/:id/create', method: RequestMethod.POST },
                { path: '/meals/:id/edit', method: RequestMethod.POST },
                { path: '/meals/:id/delete', method: RequestMethod.POST }
            );
    }
}
