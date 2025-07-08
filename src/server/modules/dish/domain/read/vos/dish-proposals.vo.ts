import { DishProposalVo } from './dish-proposal.vo';
import { DishResultVo } from './dish-result.vo';
import { MergedSearchQueriesVo } from './merged-search-queries.vo';

export class DishProposalsVo {

    private constructor(
        private readonly proposals: DishProposalVo[]
    ) {}

    static fromDishResultVos(dishResultVos: DishResultVo[], mergedSearchQueriesVo: MergedSearchQueriesVo): DishProposalsVo {
        const proposals = DishProposalVo.fromDishResultVos(dishResultVos, mergedSearchQueriesVo);

        return new DishProposalsVo(proposals);
    }

    getTopTenProposals(): DishProposalVo[] {
        return this.proposals
            .sort(this.sortDescendingRecommendationPoints)
            .slice(0, 10);
    }

    sortDescendingRecommendationPoints(proposal0: DishProposalVo, proposal1: DishProposalVo): number {
        return proposal1.recommendationPoints - proposal0.recommendationPoints;
    }
}