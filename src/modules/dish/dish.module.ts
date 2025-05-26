import { Module } from '@nestjs/common';
import { DishOrchestrator } from './dish.orchestrator';
import { MongooseModule } from '@nestjs/mongoose';
import { DishController } from './dish.controller';
import { dishCommentModel, dishModel, dishRatingModel, userSearchQueryModel } from '../../common/definitions/mongoose-model.definitions';
import { RedisModule } from '../redis/redis.module';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { IngredientModule } from '../ingredient/ingredient.module';
import { UserSearchQueryRepository } from '../../mongodb/repositories/user-search-query.repository';
import { TranslationModule } from '../translation/translation.module';
import { DishReadModule } from './read/dish-read.module';
import { DishWriteModule } from './write/dish-write.module';

@Module({
    imports: [
        MongooseModule.forFeature([dishModel, dishCommentModel, dishRatingModel, userSearchQueryModel]),
        DishReadModule,
        DishWriteModule,
        RedisModule, // FIXME: Discard?
        JwtManagerModule, // FIXME: Discard
        IngredientModule,
        TranslationModule // FIXME: Discard?
    ],
    controllers: [DishController],
    providers: [
        DishOrchestrator,
        UserSearchQueryRepository
    ],
    exports: []
})
export class DishModule {}
