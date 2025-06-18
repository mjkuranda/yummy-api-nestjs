import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IngredientService } from './ingredient.service';

@Module({
    imports: [HttpModule],
    providers: [IngredientService],
    exports: [IngredientService]
})
export class IngredientModule {}
