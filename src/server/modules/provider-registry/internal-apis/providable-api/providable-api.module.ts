import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    dishCommentModel,
    dishModel,
    dishRatingModel,
    dishRecipeModel, userActionModel, userModel, userSearchQueryModel
} from '../../../../common/definitions/mongoose-model.definitions';
import { REPOSITORIES_PROVIDERS } from '../internal-api.providers';
import { ProvidableApiService } from './providable-api.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            dishModel,
            dishCommentModel,
            dishRatingModel,
            dishRecipeModel,
            userModel,
            userActionModel,
            userSearchQueryModel
        ])
    ],
    providers: [...REPOSITORIES_PROVIDERS, ProvidableApiService],
    exports: [...REPOSITORIES_PROVIDERS, ProvidableApiService]
})
export class ProvidableApiModule {}