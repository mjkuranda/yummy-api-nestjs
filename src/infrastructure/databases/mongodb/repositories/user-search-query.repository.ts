import { AbstractRepository } from './abstract.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSearchQueryDocument } from '../documents/user-search-query.document';
import { userSearchQueryModel } from '../../../../server/common/definitions/mongoose-model.definitions';
import { DishProposalDto } from '../../../../server/modules/dish/dish.types';

// TODO: Deprecated
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