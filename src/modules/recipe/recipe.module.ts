import { Module } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { TranslationModule } from '../translation/translation.module';
import { DishSourceModule } from '../dish/source/dish-source.module';

@Module({
    imports: [
        DishSourceModule,
        JwtManagerModule,
        TranslationModule
    ],
    controllers: [RecipeController],
    providers: [RecipeService],
    exports: [RecipeService]
})
export class RecipeModule {}
