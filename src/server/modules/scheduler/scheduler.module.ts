import { Module } from '@nestjs/common';
import { SyncDishCronService } from './sync-dish-cron.service';
import { ProviderRegistryModule } from '../provider-registry/provider-registry.module';

@Module({
    imports: [ProviderRegistryModule],
    providers: [SyncDishCronService]
})
export class SchedulerModule {}