import { LoggerModule } from './modules/logger/logger.module';
import { JwtManagerModule } from './modules/jwt-manager/jwt-manager.module';
import { CacheModule } from './modules/cache/cache.module';
import { IngredientModule } from './modules/ingredient/ingredient.module';
import { RecipeModule } from './modules/recipe/recipe.module';
import { DishModule } from './modules/dish/dish.module';
import { UserModule } from './modules/user/user.module';
import { HealthcheckModule } from './modules/healthcheck/healthcheck.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongooseUri } from './utils';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DynamicModule, Type } from '@nestjs/common';

export const globalModules: Type[] = [
    LoggerModule,
    JwtManagerModule,
    CacheModule
];

export const domainModules: Type[] = [
    DishModule,
    UserModule,
    RecipeModule,
    IngredientModule
];

export const systemModules: Type[] = [
    HealthcheckModule,
    NotificationModule
];

export const configModules: DynamicModule[] = [
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
];