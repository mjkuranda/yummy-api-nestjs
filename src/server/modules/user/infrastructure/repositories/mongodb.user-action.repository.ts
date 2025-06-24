import { UserActionRepository } from '../../domain/repositories';
import { isValidObjectId, Model } from 'mongoose';
import {
    UserActionDocument,
    UserActionType
} from '../../../../../infrastructure/databases/mongodb/documents';
import { UserActionEntity } from '../../domain/entities';
import { userActionModel } from '../../../../common/definitions/mongoose-model.definitions';
import { InjectModel } from '@nestjs/mongoose';
import { InvalidMongooseObjectIdError } from '../../../../errors/infrastructure';

export class MongodbUserActionRepository implements UserActionRepository {

    constructor(
        @InjectModel(userActionModel.name) private readonly model: Model<UserActionDocument>
    ) {}

    async createAction(userId: string, type: UserActionType): Promise<UserActionEntity> {
        if (!isValidObjectId(userId)) {
            throw new InvalidMongooseObjectIdError(userId);
        }

        const doc = await this.model.create({ userId, type });

        if (!doc) {
            return null;
        }

        return UserActionEntity.fromDocument(doc);
    }

    async deleteAction(id: string): Promise<void> {
        if (!isValidObjectId(id)) {
            throw new InvalidMongooseObjectIdError(id);
        }

        await this.model.deleteOne({ _id: id });
    }

    async findActionById(id: string): Promise<UserActionEntity | null> {
        if (!isValidObjectId(id)) {
            throw new InvalidMongooseObjectIdError(id);
        }

        const doc = await this.model.findById(id);

        if (!doc) {
            return null;
        }

        return UserActionEntity.fromDocument(doc);
    }

    async findActionByUserId(userId: string): Promise<UserActionEntity | null> {
        if (!isValidObjectId(userId)) {
            throw new InvalidMongooseObjectIdError(userId);
        }

        const doc = await this.model.findOne({ userId });

        if (!doc) {
            return null;
        }

        return UserActionEntity.fromDocument(doc);
    }
}