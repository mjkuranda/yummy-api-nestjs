import { Module } from '@nestjs/common';
import { DishService } from './dish.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DishController } from './dish.controller';
import { DISH_COMMENT_MODEL, DISH_MODEL, DISH_RATING_MODEL, SEARCH_QUERY_MODEL } from '../../constants/models.constant';
import { RedisModule } from '../redis/redis.module';
import { DishRepository } from '../../mongodb/repositories/dish.repository';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { IngredientModule } from '../ingredient/ingredient.module';
import { SearchQueryRepository } from '../../mongodb/repositories/search-query.repository';
import { TranslationModule } from '../translation/translation.module';
import { DishCommentRepository } from '../../mongodb/repositories/dish-comment.repository';
import { DishRatingRepository } from '../../mongodb/repositories/dish-rating.repository';
import { ExternalApiModule } from '../api/external-api.module';

@Module({
    imports: [
        MongooseModule.forFeature([DISH_MODEL, DISH_COMMENT_MODEL, DISH_RATING_MODEL, SEARCH_QUERY_MODEL]),
        RedisModule,
        JwtManagerModule,
        IngredientModule,
        ExternalApiModule,
        TranslationModule
    ],
    controllers: [DishController],
    providers: [DishService, DishRepository, DishCommentRepository, DishRatingRepository, SearchQueryRepository, JwtManagerService],
})
export class DishModule {}
