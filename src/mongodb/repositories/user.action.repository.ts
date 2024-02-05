import { AbstractRepository } from './abstract.repository';
import { UserActionDocument } from '../documents/user-action.document';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { models } from '../../constants/models.constant';

export class UserActionRepository extends AbstractRepository<UserActionDocument> {

    constructor(@InjectModel(models.USER_ACTION_MODEL) model: Model<UserActionDocument>) {
        super(model);
    }
}