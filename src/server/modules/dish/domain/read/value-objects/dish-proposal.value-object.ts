import { DishResultValueObject } from './dish-result.value-object';
import { MergedSearchQueriesValueObject } from './merged-search-queries.value-object';
import { EncodedDishIdValueObject } from '../../common/value-objects';

export class DishProposalValueObject {

    constructor(
        public readonly encodedDishIdVo: EncodedDishIdValueObject,
        public readonly title: string,
        public readonly recommendationPoints: number,
        public readonly imgUrl?: string
    ) {}

    static fromDishResultVo(dishResultVo: DishResultValueObject, mergedSearchQueriesVo: MergedSearchQueriesValueObject): DishProposalValueObject {
        const recommendationPoints = dishResultVo.ingredients.reduce((points, ingredient) => {
            const newPoints = mergedSearchQueriesVo.getPoints(ingredient);

            return points + newPoints;
        }, 0);

        return new DishProposalValueObject(
            dishResultVo.encodedDishId,
            dishResultVo.title,
            recommendationPoints,
            dishResultVo.imgUrl
        );
    }

    static fromDishResultVos(dishResultVos: DishResultValueObject[], mergedSearchQueriesVo: MergedSearchQueriesValueObject): DishProposalValueObject[] {
        return dishResultVos.map(result => DishProposalValueObject.fromDishResultVo(result, mergedSearchQueriesVo));
    }

}