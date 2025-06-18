import { Module } from '@nestjs/common';
import { ProviderModule } from '../../../provider/provider.module';
import { DishReadService } from './dish-read.service';
import { DishAggregatorService } from './dish-aggregator.service';

@Module({
    imports: [ProviderModule],
    providers: [DishReadService, DishAggregatorService],
    exports: [DishReadService]
})
export class DishReadModule {}