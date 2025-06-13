import { DishProposalValueObject } from './dish-proposal.value-object';
import { DishResultValueObject } from './dish-result.value-object';
import { MergedSearchQueriesValueObject } from './merged-search-queries.value-object';

export class DishProposalsValueObject {

    private constructor(
        private readonly proposals: DishProposalValueObject[]
    ) {}

    static fromDishResultVos(dishResultVos: DishResultValueObject[], mergedSearchQueriesVo: MergedSearchQueriesValueObject): DishProposalsValueObject {
        const proposals = DishProposalValueObject.fromDishResultVos(dishResultVos, mergedSearchQueriesVo);

        return new DishProposalsValueObject(proposals);
    }

    getTopTenProposals(): DishProposalValueObject[] {
        return this.proposals
            .sort(this.sortDescendingRecommendationPoints)
            .slice(0, 10);
    }

    sortDescendingRecommendationPoints(proposal0: DishProposalValueObject, proposal1: DishProposalValueObject): number {
        return proposal1.recommendationPoints - proposal0.recommendationPoints;
    }
}