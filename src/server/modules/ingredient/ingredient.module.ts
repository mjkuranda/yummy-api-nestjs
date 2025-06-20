import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IngredientService } from './ingredient.service';

@Global()
@Module({
    imports: [HttpModule],
    providers: [IngredientService],
    exports: [IngredientService]
})
export class IngredientModule {}
