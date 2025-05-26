import { Module } from '@nestjs/common';
import { dishProviders } from './dish-source.provider';
import { DishSourceRegistryService } from './dish-source-registry.service';

@Module({
    providers: [...dishProviders, DishSourceRegistryService],
    exports: [DishSourceRegistryService]
})
export class DishSourceModule {}