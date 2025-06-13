import { Module } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { RecipeApplicationModule } from './application/recipe-application.module';

@Module({
    imports: [
        RecipeApplicationModule,
        JwtManagerModule
    ],
    controllers: [RecipeController]
})
export class RecipeModule {}
