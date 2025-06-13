export class DishProposalDto {

    constructor(
        public readonly encodedDishIdValue: string,
        public readonly title: string,
        public readonly recommendationPoints: number,
        public readonly imgUrl?: string
    ) {}
}