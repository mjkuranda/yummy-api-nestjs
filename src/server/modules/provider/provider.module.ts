import { Module } from '@nestjs/common';
import { ProviderRegistryService } from './provider-registry.service';
import { providerRepositories, providerServices } from './provider.provider';
import { HttpModule } from '@nestjs/axios';
import { SpoonacularApiAdapter } from '../../../integrations/spoonacular-api/spoonacular-api.adapter';
import { MongooseModule } from '@nestjs/mongoose';
import {
    dishCommentModel,
    dishModel,
    dishRatingModel,
    dishRecipeModel, userActionModel, userModel, userSearchQueryModel
} from '../../common/definitions/mongoose-model.definitions';

@Module({
    imports: [
        HttpModule.register({
            timeout: 5000,
            maxRedirects: 5,
        }),
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
    providers: [
        ...providerServices,
        ...providerRepositories,
        ProviderRegistryService,
        SpoonacularApiAdapter
    ],
    exports: [ProviderRegistryService]
})
export class ProviderModule {}