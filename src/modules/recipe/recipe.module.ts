import { Module } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { RecipeRepository } from '../../mongodb/repositories/recipe.repository';
import { DishRepository } from '../../mongodb/repositories/dish.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { DISH_MODEL, RECIPE_MODEL } from '../../constants/models.constant';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { RedisModule } from '../redis/redis.module';
import { ExternalApiModule } from '../api/external-api.module';
import { TranslationModule } from '../translation/translation.module';

@Module({
    imports: [
        MongooseModule.forFeature([RECIPE_MODEL, DISH_MODEL]),
        JwtManagerModule,
        RedisModule,
        ExternalApiModule,
        TranslationModule
    ],
    controllers: [RecipeController],
    providers: [RecipeService, RecipeRepository, DishRepository],
    exports: [RecipeService]
})
export class RecipeModule {}
