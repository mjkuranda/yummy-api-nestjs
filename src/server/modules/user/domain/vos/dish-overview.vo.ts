import { DishDocument } from '../../../../../infrastructure/databases/mongodb/documents/dish.document';

export class DishOverviewVo {

    constructor(
        public readonly title: string
    ) {}

    static fromDocuments(docs: DishDocument[]): DishOverviewVo[] {
        return docs
            .map(doc =>
                new DishOverviewVo(doc.title)
            );
    }
}