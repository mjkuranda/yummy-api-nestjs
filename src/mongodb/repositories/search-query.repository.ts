import { AbstractRepository } from './abstract.repository';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { SearchQueryDocument } from '../documents/search-query.document';
import { MealProposalDto } from '../../modules/meal/meal.types';

export class SearchQueryRepository extends AbstractRepository<SearchQueryDocument, MealProposalDto> {

    constructor(@InjectModel(models.SEARCH_QUERY_MODEL) model: Model<SearchQueryDocument>) {
        super(model);
    }
}