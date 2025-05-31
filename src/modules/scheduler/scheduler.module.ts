import { Module } from '@nestjs/common';
import { SyncDishCronService } from './sync-dish-cron.service';
import { DishSourceModule } from '../dish/source/dish-source.module';

@Module({
    imports: [DishSourceModule],
    providers: [SyncDishCronService]
})
export class SchedulerModule {}