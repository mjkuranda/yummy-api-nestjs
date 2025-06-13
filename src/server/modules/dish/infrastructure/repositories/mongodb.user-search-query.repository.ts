import { UserSearchQueryRepository } from '../../domain/common/repositories';
import { UserSearchQueryEntity } from '../../domain/common/entities';
import { InjectModel } from '@nestjs/mongoose';
import { userSearchQueryModel } from '../../../../common/definitions/mongoose-model.definitions';
import { UserSearchQueryDocument } from '../../../../../infrastructure/databases/mongodb/documents/user-search-query.document';
import { Model } from 'mongoose';

export class MongodbUserSearchQueryRepository implements UserSearchQueryRepository {

    constructor(
        @InjectModel(userSearchQueryModel.name) private readonly model: Model<UserSearchQueryDocument>
    ) {}

    async findAllRecentQueries(userLogin: string): Promise<UserSearchQueryEntity[]> {
        const dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - 14);

        const userSearchQueries: UserSearchQueryDocument[] = await this.model.find(
            {
                date: {
                    $gte: dateFilter
                },
                login: userLogin
            }
        );

        return UserSearchQueryEntity.fromDocuments(userSearchQueries);
    }

    async insertNewQuery(userLogin: string, ingredients: string[]): Promise<void> {
        await this.model.create({
            login: userLogin,
            ingredients,
            date: new Date()
        });
    }

}