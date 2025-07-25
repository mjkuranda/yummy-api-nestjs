import { DishResultVo } from './dish-result.vo';
import { MergedSearchQueriesVo } from './merged-search-queries.vo';
import { DishId } from '../../../../../common/types';
import { Provider } from '../../../../../common/enums';

export class DishProposalVo {

    constructor(
        public readonly dishId: DishId,
        public readonly provider: Provider,
        public readonly title: string,
        public readonly recommendationPoints: number,
        public readonly imgUrl?: string
    ) {}

    static fromDishResultVo(dishResultVo: DishResultVo, mergedSearchQueriesVo: MergedSearchQueriesVo): DishProposalVo {
        const recommendationPoints = dishResultVo.ingredients.reduce((points, ingredient) => {
            const newPoints = mergedSearchQueriesVo.getPoints(ingredient);

            return points + newPoints;
        }, 0);

        return new DishProposalVo(
            dishResultVo.dishId,
            dishResultVo.provider,
            dishResultVo.title,
            recommendationPoints,
            dishResultVo.imgUrl
        );
    }

    static fromDishResultVos(dishResultVos: DishResultVo[], mergedSearchQueriesVo: MergedSearchQueriesVo): DishProposalVo[] {
        return dishResultVos.map(result => DishProposalVo.fromDishResultVo(result, mergedSearchQueriesVo));
    }

}