import { Module } from '@nestjs/common';
import { MealService } from './meal.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MealController } from './meal.controller';
import { MEAL_COMMENT_MODEL, MEAL_MODEL, MEAL_RATING_MODEL, SEARCH_QUERY_MODEL } from '../../constants/models.constant';
import { RedisModule } from '../redis/redis.module';
import { MealRepository } from '../../mongodb/repositories/meal.repository';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { SpoonacularApiModule } from '../api/spoonacular/spoonacular.api.module';
import { IngredientModule } from '../ingredient/ingredient.module';
import { SearchQueryRepository } from '../../mongodb/repositories/search-query.repository';
import { TranslationModule } from '../translation/translation.module';
import { MealCommentRepository } from '../../mongodb/repositories/meal-comment.repository';
import { MealRatingRepository } from '../../mongodb/repositories/meal-rating.repository';

@Module({
    imports: [
        MongooseModule.forFeature([MEAL_MODEL, MEAL_COMMENT_MODEL, MEAL_RATING_MODEL, SEARCH_QUERY_MODEL]),
        RedisModule,
        JwtManagerModule,
        IngredientModule,
        SpoonacularApiModule,
        TranslationModule
    ],
    controllers: [MealController],
    providers: [MealService, MealRepository, MealCommentRepository, MealRatingRepository, SearchQueryRepository, JwtManagerService],
})
export class MealModule {}
