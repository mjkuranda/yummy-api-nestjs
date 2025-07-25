import { Module } from '@nestjs/common';
import { dishApplicationProviders } from './dish-application.provider';
import { DishCommandFacade } from './dish-command.facade';
import { DishQueryFacade } from './dish-query.facade';
import { TranslationModule } from '../../translation/translation.module';
import { DishWriteModule } from '../domain/write/dish-write.module';
import { DishReadModule } from '../domain/read/dish-read.module';
import { DishTokenService } from '../domain/common/services';

@Module({
    imports: [TranslationModule, DishWriteModule, DishReadModule],
    providers: [DishCommandFacade, DishQueryFacade, ...dishApplicationProviders, DishTokenService],
    exports: [DishCommandFacade, DishQueryFacade, ...dishApplicationProviders]
})
export class DishApplicationModule {}