import { Module } from '@nestjs/common';
import { RecipeFacade } from './recipe.facade';
import { recipeApplicationProviders } from './recipe-application.provider';
import { RecipeDomainModule } from '../domain/recipe-domain.module';

@Module({
    imports: [RecipeDomainModule],
    providers: [RecipeFacade, ...recipeApplicationProviders],
    exports: [RecipeFacade]
})
export class RecipeApplicationModule {}