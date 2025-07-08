import { UserSearchQueryEntity } from '../../common/entities';

type MergedSearchQueries = Record<string, number>;

export class MergedSearchQueriesVo {

    constructor(
        private readonly queries: MergedSearchQueries
    ) {}

    static fromEntities(searchQueryEntities: UserSearchQueryEntity[]): MergedSearchQueriesVo {
        const merged: MergedSearchQueries = {};

        for (const query of searchQueryEntities) {
            const { ingredients } = query;

            for (const ingredient of ingredients) {
                if (merged[ingredient]) {
                    merged[ingredient]++;
                } else {
                    merged[ingredient] = 1;
                }
            }
        }

        return new MergedSearchQueriesVo(merged);
    }

    getIngredients(): string[] {
        return Object.keys(this.queries);
    }

    getPoints(ingredient: string): number {
        return this.queries[ingredient] ?? 0;
    }
}