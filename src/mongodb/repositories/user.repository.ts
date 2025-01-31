import { AbstractRepository } from './abstract.repository';
import { UserDocument } from '../documents/user.document';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { models } from '../../constants/models.constant';
import { CreateUserDto } from '../../modules/user/user.dto';
import { UserObject, UserProfile } from '../../modules/user/user.types';

@Injectable()
export class UserRepository extends AbstractRepository<UserDocument, CreateUserDto> {

    constructor(@InjectModel(models.USER_MODEL) model: Model<UserDocument>) {
        super(model);
    }

    async findByLogin(login: string): Promise<UserDocument | null> {
        return this.model.findOne({ login });
    }

    async getAllNotActivated(): Promise<UserDocument[]> {
        return this.model.find({
            $or: [
                { activated: { $eq: false }},
                { activated: { $exists: false }}
            ]
        },
        {
            _id: 1,
            email: 1,
            login: 1
        });
    }

    async getAll(): Promise<UserObject[]> {
        return this.model.aggregate([
            {
                $project: {
                    id: '$_id',
                    email: 1,
                    login: 1,
                    isAdmin: 1,
                    capabilities: 1,
                    _id: 0
                },
            },
        ]);
    }

    async changePassword(login: string, hashedPassword: string, salt: string): Promise<void> {
        await this.model.updateOne({ login }, {
            $set: {
                password: hashedPassword,
                salt
            }
        });
    }

    async getProfile(login: string): Promise<UserProfile> {
        const aggregatedUsers = this.model.aggregate<UserProfile>([
            {
                $match: { login }
            },
            {
                $lookup: {
                    from: 'dish_models',
                    localField: 'login',
                    foreignField: 'author',
                    as: 'dishList'
                }
            },
            {
                $project: {
                    _id: 0,
                    login: 1,
                    isAdmin: 1,
                    capabilities: 1,
                    activated: 1,
                    dishList: {
                        $map: {
                            input: '$dishList',
                            as: 'dish',
                            in: {
                                id: '$$dish._id',
                                title: '$$dish.title'
                            }
                        }
                    }
                }
            }
        ]);

        const users = await aggregatedUsers;

        return users[0];
    }
}