import { Module } from '@nestjs/common';
import { DishService } from './dish.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DishController } from './dish.controller';
import { dishCommentModel, dishModel, dishRatingModel, userSearchQueryModel } from '../../common/definitions/mongoose-model.definitions';
import { RedisModule } from '../redis/redis.module';
import { DishRepository } from '../../mongodb/repositories/dish.repository';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { IngredientModule } from '../ingredient/ingredient.module';
import { UserSearchQueryRepository } from '../../mongodb/repositories/user-search-query.repository';
import { TranslationModule } from '../translation/translation.module';
import { DishCommentRepository } from '../../mongodb/repositories/dish-comment.repository';
import { DishRatingRepository } from '../../mongodb/repositories/dish-rating.repository';
import { ExternalApiModule } from '../api/external-api.module';

@Module({
    imports: [
        MongooseModule.forFeature([dishModel, dishCommentModel, dishRatingModel, userSearchQueryModel]),
        RedisModule,
        JwtManagerModule,
        IngredientModule,
        ExternalApiModule,
        TranslationModule
    ],
    controllers: [DishController],
    providers: [DishService, DishRepository, DishCommentRepository, DishRatingRepository, UserSearchQueryRepository, JwtManagerService],
})
export class DishModule {}
