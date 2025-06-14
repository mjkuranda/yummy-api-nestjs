import { UserActionRepository } from '../../domain/repositories';
import { isValidObjectId, Model } from 'mongoose';
import {
    UserActionDocument,
    UserActionType
} from '../../../../../infrastructure/databases/mongodb/documents/user-action.document';
import { UserActionEntity } from '../../domain/entities';
import { userActionModel } from '../../../../common/definitions/mongoose-model.definitions';
import { InjectModel } from '@nestjs/mongoose';
import { InvalidMongooseObjectIdError } from '../../../../errors/infrastructure';

export class MongodbUserActionRepository implements UserActionRepository {

    constructor(
        @InjectModel(userActionModel.name) private readonly model: Model<UserActionDocument>
    ) {}

    async create(userId: string, type: UserActionType): Promise<UserActionEntity> {
        if (!isValidObjectId(userId)) {
            throw new InvalidMongooseObjectIdError(userId);
        }

        const doc = await this.model.create({ userId, type });

        if (!doc) {
            return null;
        }

        return UserActionEntity.fromDocument(doc);
    }

    async delete(id: string): Promise<void> {
        if (!isValidObjectId(id)) {
            throw new InvalidMongooseObjectIdError(id);
        }

        await this.model.deleteOne({ _id: id });
    }

    async findById(id: string): Promise<UserActionEntity | null> {
        if (!isValidObjectId(id)) {
            throw new InvalidMongooseObjectIdError(id);
        }

        const doc = await this.model.findById(id);

        if (!doc) {
            return null;
        }

        return UserActionEntity.fromDocument(doc);
    }

    async findByUserId(query: any): Promise<UserActionEntity | null> {
        return Promise.resolve(undefined);
    }
}