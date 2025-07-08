import { DishResultVo } from './dish-result.vo';
import { MergedSearchQueriesVo } from './merged-search-queries.vo';
import { EncodedDishIdVo } from '../../common/vos';

export class DishProposalVo {

    constructor(
        public readonly encodedDishIdVo: EncodedDishIdVo,
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
            dishResultVo.encodedDishId,
            dishResultVo.title,
            recommendationPoints,
            dishResultVo.imgUrl
        );
    }

    static fromDishResultVos(dishResultVos: DishResultVo[], mergedSearchQueriesVo: MergedSearchQueriesVo): DishProposalVo[] {
        return dishResultVos.map(result => DishProposalVo.fromDishResultVo(result, mergedSearchQueriesVo));
    }

}