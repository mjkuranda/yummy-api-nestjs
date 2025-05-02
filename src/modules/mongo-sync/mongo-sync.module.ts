import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMongooseUri } from '../../utils';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoSyncService } from './mongo-sync.service';
import {
    dishCommentModel,
    dishModel,
    dishRatingModel,
    dishRecipeModel, userActionModel, userModel, userSearchQueryModel
} from '../../common/definitions/mongoose-model.definitions';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [
        LoggerModule,
        ConfigModule.forRoot({
            envFilePath: ['.env'],
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async () => ({
                uri: getMongooseUri()
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
        ]),
    ],
    providers: [MongoSyncService],
})
export class MongoSyncModule {}
