import { Module } from '@nestjs/common';
import { SyncDishCronService } from './sync-dish-cron.service';
import { ProviderModule } from '../provider/provider.module';

@Module({
    imports: [ProviderModule],
    providers: [SyncDishCronService]
})
export class SchedulerModule {}