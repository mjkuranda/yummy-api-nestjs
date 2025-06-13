import { AbstractRepository } from './abstract.repository';
import { UserActionDocument } from '../documents/user-action.document';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { userActionModel } from '../../common/definitions/mongoose-model.definitions';

export class UserActionRepository extends AbstractRepository<UserActionDocument, { userId: string, type: string }> {

    constructor(@InjectModel(userActionModel.name) model: Model<UserActionDocument>) {
        super(model);
    }
}