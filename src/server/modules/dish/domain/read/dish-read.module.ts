import { Module } from '@nestjs/common';
import { ProviderRegistryModule } from '../../../provider-registry/provider-registry.module';
import { DishReadService, DishAggregatorService } from './services';

@Module({
    imports: [ProviderRegistryModule],
    providers: [DishReadService, DishAggregatorService],
    exports: [DishReadService]
})
export class DishReadModule {}