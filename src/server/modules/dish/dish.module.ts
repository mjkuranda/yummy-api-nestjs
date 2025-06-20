import { Module } from '@nestjs/common';
import { DishController } from './dish.controller';
import { DishApplicationModule } from './application/dish-application.module';

@Module({
    imports: [DishApplicationModule],
    controllers: [DishController]
})
export class DishModule {}
