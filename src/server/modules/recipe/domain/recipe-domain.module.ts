import { Module } from '@nestjs/common';
import { RecipeService } from './services/recipe.service';
import { ProviderRegistryModule } from '../../provider-registry/provider-registry.module';
import { TranslationModule } from '../../translation/translation.module';

@Module({
    imports: [ProviderRegistryModule, TranslationModule],
    providers: [RecipeService],
    exports: [RecipeService]
})
export class RecipeDomainModule {}