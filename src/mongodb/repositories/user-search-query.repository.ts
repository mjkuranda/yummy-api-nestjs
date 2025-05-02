import { AbstractRepository } from './abstract.repository';
import { InjectModel } from '@nestjs/mongoose';
import { userSearchQueryModel } from '../../common/definitions/mongoose-model.definitions';
import { Model } from 'mongoose';
import { UserSearchQueryDocument } from '../documents/user-search-query.document';
import { DishProposalDto } from '../../modules/dish/dish.types';

export class UserSearchQueryRepository extends AbstractRepository<UserSearchQueryDocument, DishProposalDto> {

    constructor(@InjectModel(userSearchQueryModel.name) model: Model<UserSearchQueryDocument>) {
        super(model);
    }

    async findAllRecentQueries(login: string): Promise<UserSearchQueryDocument[]> {
        const dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - 14);

        const userSearchQueries: UserSearchQueryDocument[] = await this.findAll(
            {
                date: {
                    $gte: dateFilter
                },
                login
            }
        );

        return userSearchQueries;
    }
}