import { UserSearchQueryEntity } from '../../common/entities';

type MergedSearchQueries = Record<string, number>;

export class MergedSearchQueriesValueObject {

    constructor(
        private readonly queries: MergedSearchQueries
    ) {}

    static fromEntities(searchQueryEntities: UserSearchQueryEntity[]): MergedSearchQueriesValueObject {
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

        return new MergedSearchQueriesValueObject(merged);
    }

    getIngredients(): string[] {
        return Object.keys(this.queries);
    }

    getPoints(ingredient: string): number {
        return this.queries[ingredient] ?? 0;
    }
}