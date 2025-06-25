import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongooseUri } from '../../../utils';
import {
    dishCommentModel,
    dishModel,
    dishRatingModel,
    dishRecipeModel, userActionModel, userModel, userSearchQueryModel
} from '../../../common/definitions/mongoose-model.definitions';

export const mongoDatabaseImports = [
    ConfigModule,
    MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async () => ({
            uri: getMongooseUri(),
        }),
        inject: [ConfigService],
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
];