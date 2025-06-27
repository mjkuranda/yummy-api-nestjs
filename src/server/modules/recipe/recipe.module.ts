import { Module } from '@nestjs/common';
import { RecipeApplicationModule } from './application/recipe-application.module';
import { RecipeController } from './presentation/controllers/recipe.controller';

@Module({
    imports: [RecipeApplicationModule],
    controllers: [RecipeController]
})
export class RecipeModule {}
