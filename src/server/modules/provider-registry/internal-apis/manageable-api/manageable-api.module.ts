import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    dishCommentModel,
    dishModel,
    dishRatingModel,
    dishRecipeModel, userActionModel, userModel, userSearchQueryModel
} from '../../../../common/definitions/mongoose-model.definitions';
import { REPOSITORIES_PROVIDERS } from '../internal-api.providers';
import { API_PROVIDERS } from './manageable-api.providers';

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
    providers: [...API_PROVIDERS, ...REPOSITORIES_PROVIDERS],
    exports: [...API_PROVIDERS]
})
export class ManageableApiModule {}