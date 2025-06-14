import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DishController } from './dish.controller';
import { dishCommentModel, dishModel, dishRatingModel, userSearchQueryModel } from '../../common/definitions/mongoose-model.definitions';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { IngredientModule } from '../ingredient/ingredient.module';
import { DishApplicationModule } from './application/dish-application.module';

@Module({
    imports: [
        MongooseModule.forFeature([dishModel, dishCommentModel, dishRatingModel, userSearchQueryModel]),
        DishApplicationModule,
        JwtManagerModule, // FIXME: Discard
        IngredientModule
    ],
    controllers: [DishController]
})
export class DishModule {}
