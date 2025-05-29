import { Module } from '@nestjs/common';
import { dishApplicationProviders } from './dish-application.provider';
import { DishCommandFacade } from './dish-command.facade';
import { DishQueryFacade } from './dish-query.facade';
import { TranslationModule } from '../../translation/translation.module';
import { IngredientModule } from '../../ingredient/ingredient.module';

@Module({
    imports: [TranslationModule, IngredientModule],
    providers: [DishCommandFacade, DishQueryFacade, ...dishApplicationProviders],
    exports: [DishCommandFacade, DishQueryFacade, ...dishApplicationProviders]
})
export class DishApplicationModule {}