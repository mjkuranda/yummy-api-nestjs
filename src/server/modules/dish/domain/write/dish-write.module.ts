import { Module } from '@nestjs/common';
import { ProviderRegistryModule } from '../../../provider-registry/provider-registry.module';
import { DishWriteService } from './dish-write.service';

@Module({
    imports: [ProviderRegistryModule],
    providers: [DishWriteService],
    exports: [DishWriteService]
})
export class DishWriteModule {}