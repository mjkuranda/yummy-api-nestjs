import { AbstractRepository } from './abstract.repository';
import { UserDocument } from '../documents/user.document';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { models } from '../../constants/models.constant';
import { CreateUserDto } from '../../modules/user/user.dto';

@Injectable()
export class UserRepository extends AbstractRepository<UserDocument, CreateUserDto> {

    constructor(@InjectModel(models.USER_MODEL) model: Model<UserDocument>) {
        super(model);
    }

    async findByLogin(login: string): Promise<UserDocument | null> {
        return this.model.findOne({ login });
    }
}