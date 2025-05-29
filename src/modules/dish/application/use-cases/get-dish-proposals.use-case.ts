import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { MergedSearchQueries, ProposedDish } from '../../dish.types';
import { UserSearchQueryDocument } from '../../../../mongodb/documents/user-search-query.document';
import { mergeSearchQueries } from '../../dish.utils';
import { UserSearchQueryRepository } from '../../../../mongodb/repositories/user-search-query.repository';
import { DishReadService } from '../../read/dish-read.service';
import { LoggerService } from '../../../logger/logger.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetDishProposalsUseCase extends AbstractUseCase<[UserAccessTokenPayload], ProposedDish[]> {

    constructor(
        private readonly userSearchQueryRepository: UserSearchQueryRepository,
        private readonly dishReadService: DishReadService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    async execute(user: UserAccessTokenPayload): Promise<any> {
        // TODO: Consider creating CRON to create recommendation for a particular user
        const userSearchQueries: UserSearchQueryDocument[] = await this.userSearchQueryRepository.findAllRecentQueries(user.login);
        const mergedSearchQueries: MergedSearchQueries = mergeSearchQueries(userSearchQueries);
        const ingredients = Object.keys(mergedSearchQueries);

        const dishProposal = await this.dishReadService.getDishProposals(ingredients, mergedSearchQueries);

        this.loggerService.info('GetDishProposalsUseCase/execute', `Generated ${dishProposal.length} dish proposal${dishProposal.length > 1 || dishProposal.length === 0 ? 's' : ''}.`);

        return dishProposal;
    }

}