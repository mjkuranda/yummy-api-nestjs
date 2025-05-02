import { Module } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { DishRecipeRepository } from '../../mongodb/repositories/dish-recipe.repository';
import { DishRepository } from '../../mongodb/repositories/dish.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { dishModel, dishRecipeModel } from '../../common/definitions/mongoose-model.definitions';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { RedisModule } from '../redis/redis.module';
import { ExternalApiModule } from '../api/external-api.module';
import { TranslationModule } from '../translation/translation.module';

@Module({
    imports: [
        MongooseModule.forFeature([dishRecipeModel, dishModel]),
        JwtManagerModule,
        RedisModule,
        ExternalApiModule,
        TranslationModule
    ],
    controllers: [RecipeController],
    providers: [RecipeService, DishRecipeRepository, DishRepository],
    exports: [RecipeService]
})
export class RecipeModule {}
