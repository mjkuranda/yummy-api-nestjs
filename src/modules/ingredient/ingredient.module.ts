import { Module } from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [LoggerModule],
    providers: [IngredientService],
    exports: [IngredientService]
})
export class IngredientModule {}
