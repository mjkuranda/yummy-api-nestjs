import { Module } from '@nestjs/common';
import { DishSourceModule } from '../source/dish-source.module';

@Module({
    imports: [DishSourceModule]
    // TODO: provide service and export
})
export class DishWriteModule {}