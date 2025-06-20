import { Module } from '@nestjs/common';
import { ProviderRegistryModule } from '../../../provider-registry/provider-registry.module';
import { DishReadService } from './dish-read.service';
import { DishAggregatorService } from './dish-aggregator.service';

@Module({
    imports: [ProviderRegistryModule],
    providers: [DishReadService, DishAggregatorService],
    exports: [DishReadService]
})
export class DishReadModule {}