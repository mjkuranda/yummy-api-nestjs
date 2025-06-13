import { Module } from '@nestjs/common';
import { TranslationModule } from '../../translation/translation.module';
import { RecipeFacade } from './recipe.facade';
import { RecipeService } from '../domain/services/recipe.service';
import { recipeApplicationProviders } from './recipe-application.provider';

@Module({
    imports: [TranslationModule],
    providers: [RecipeFacade, RecipeService, ...recipeApplicationProviders],
    exports: [RecipeFacade]
})
export class RecipeApplicationModule {}