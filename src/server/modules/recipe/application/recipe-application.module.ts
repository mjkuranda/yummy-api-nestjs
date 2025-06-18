import { Module } from '@nestjs/common';
import { ProviderModule } from '../../provider/provider.module';
import { TranslationModule } from '../../translation/translation.module';
import { RecipeFacade } from './recipe.facade';
import { RecipeService } from '../domain/services/recipe.service';
import { recipeApplicationProviders } from './recipe-application.provider';

@Module({
    imports: [ProviderModule, TranslationModule],
    providers: [RecipeFacade, RecipeService, ...recipeApplicationProviders],
    exports: [RecipeFacade]
})
export class RecipeApplicationModule {}