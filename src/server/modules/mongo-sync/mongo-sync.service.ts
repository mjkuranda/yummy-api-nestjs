import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import {
    dishCommentModel,
    dishModel, dishRatingModel, dishRecipeModel,
    userActionModel,
    userModel,
    userSearchQueryModel
} from '../../common/definitions/mongoose-model.definitions';
import { ContextString } from '../../common/types';
import { LoggerService } from '../logger/logger.service';
import {
    DishCommentDocument,
    DishDocument,
    DishRatingDocument, DishRecipeDocument, UserActionDocument, UserDocument, UserSearchQueryDocument
} from '../../../infrastructure/databases/mongodb/documents';

@Injectable()
export class MongoSyncService {

    constructor(
        private readonly loggerService: LoggerService,
        @InjectModel(dishModel.name) private readonly dishes: Model<DishDocument>,
        @InjectModel(dishCommentModel.name) private readonly dishComments: Model<DishCommentDocument>,
        @InjectModel(dishRatingModel.name) private readonly dishRatings: Model<DishRatingDocument>,
        @InjectModel(dishRecipeModel.name) private readonly dishRecipes: Model<DishRecipeDocument>,
        @InjectModel(userModel.name) private readonly users: Model<UserDocument>,
        @InjectModel(userActionModel.name) private readonly userActions: Model<UserActionDocument>,
        @InjectModel(userSearchQueryModel.name) private readonly userSearchQueries: Model<UserSearchQueryDocument>
    ) {}

    async synchronizeIndexes(): Promise<void> {
        const context: ContextString = 'MongoSyncService/onModuleInit';

        this.loggerService.info(context, 'Starting synchronizing indexes...');

        await this.synchronizeIndex(this.dishes);
        await this.synchronizeIndex(this.dishComments);
        await this.synchronizeIndex(this.dishRatings);
        await this.synchronizeIndex(this.dishRecipes);
        await this.synchronizeIndex(this.users);
        await this.synchronizeIndex(this.userActions);
        await this.synchronizeIndex(this.userSearchQueries);

        this.loggerService.info(context, 'Indexes synchronized.');
    }

    private async synchronizeIndex<DocumentType extends Document>(model: Model<DocumentType>): Promise<void> {
        const context: ContextString = 'MongoSyncService/synchronizeIndex';

        try {
            await model.syncIndexes();
            this.loggerService.info(context, `Synchronized successfully "${model.modelName}" model.`);
        } catch (err) {
            this.loggerService.error(context, `Error during synchronizing model "${model.name}": ${err.message}.`);
        }
    }
}
