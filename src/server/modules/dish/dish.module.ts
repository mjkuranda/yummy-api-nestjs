import { Module } from '@nestjs/common';
import { DishApplicationModule } from './application/dish-application.module';
import {
    DishCommentController,
    DishController, DishModerationController,
    DishRatingController,
    DishRecommendationController
} from './presentation/controllers';

@Module({
    imports: [DishApplicationModule],
    controllers: [
        DishController,
        DishCommentController,
        DishModerationController,
        DishRatingController,
        DishRecommendationController
    ]
})
export class DishModule {}
