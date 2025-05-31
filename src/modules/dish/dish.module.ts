import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DishController } from './dish.controller';
import { dishCommentModel, dishModel, dishRatingModel, userSearchQueryModel } from '../../common/definitions/mongoose-model.definitions';
import { RedisModule } from '../redis/redis.module';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { IngredientModule } from '../ingredient/ingredient.module';
import { UserSearchQueryRepository } from '../../mongodb/repositories/user-search-query.repository';
import { DishApplicationModule } from './application/dish-application.module';

@Module({
    imports: [
        MongooseModule.forFeature([dishModel, dishCommentModel, dishRatingModel, userSearchQueryModel]),
        DishApplicationModule,
        RedisModule, // FIXME: Discard?
        JwtManagerModule, // FIXME: Discard
        IngredientModule
    ],
    controllers: [DishController],
    providers: [UserSearchQueryRepository],
    exports: []
})
export class DishModule {}
