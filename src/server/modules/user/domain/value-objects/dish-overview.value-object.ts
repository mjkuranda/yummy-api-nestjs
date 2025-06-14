import { DishDocument } from '../../../../../infrastructure/databases/mongodb/documents/dish.document';

export class DishOverviewValueObject {

    constructor(
        public readonly title: string
    ) {}

    static fromDocuments(docs: DishDocument[]): DishOverviewValueObject[] {
        return docs
            .map(doc =>
                new DishOverviewValueObject(doc.title)
            );
    }
}