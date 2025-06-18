import { Module } from '@nestjs/common';
import { ProviderModule } from '../../../provider/provider.module';
import { DishWriteService } from './dish-write.service';
import { IngredientModule } from '../../../ingredient/ingredient.module';

@Module({
    imports: [ProviderModule, IngredientModule],
    providers: [DishWriteService],
    exports: [DishWriteService]
})
export class DishWriteModule {}