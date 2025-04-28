import { AbstractRepository } from './abstract.repository';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { SearchQueryDocument } from '../documents/search-query.document';
import { DishProposalDto } from '../../modules/dish/dish.types';

export class SearchQueryRepository extends AbstractRepository<SearchQueryDocument, DishProposalDto> {

    constructor(@InjectModel(models.SEARCH_QUERY_MODEL) model: Model<SearchQueryDocument>) {
        super(model);
    }

    async findAllRecentQueries(login: string): Promise<SearchQueryDocument[]> {
        const dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - 14);

        const searchQueries: SearchQueryDocument[] = await this.findAll(
            {
                date: {
                    $gte: dateFilter
                },
                login
            }
        );

        return searchQueries;
    }
}