import { Module } from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { LoggerModule } from '../logger/logger.module';
import { AxiosService } from '../../services/axios.service';

@Module({
    imports: [LoggerModule],
    providers: [IngredientService, AxiosService],
    exports: [IngredientService, AxiosService]
})
export class IngredientModule {}
