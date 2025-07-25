import { DishCommentEntity, DishEntity } from './entities';
import { DishDocument, DishCommentDocument } from '../../../../../infrastructure/databases/mongodb/documents';
import { Provider } from '../../../../common/enums';

export class DishFactory {

    static fromDocument(doc: DishDocument): DishEntity {
        return new DishEntity({
            id: doc._id,
            author: doc.author,
            provider: Provider.INT_DMT_USER,
            description: doc.description,
            imageUrl: doc.imageUrl,
            ingredients: doc.ingredients,
            language: doc.language,
            posted: doc.posted,
            title: doc.title,
            dishType: doc.type,
            mealType: doc.mealType,
            readyInMinutes: doc.readyInMinutes,
            softAdded: doc.softAdded,
            softDeleted: doc.softDeleted,
            softEdited: doc.softEdited
                ? DishFactory.fromDocument(doc.softEdited)
                : undefined
        });
    }

    static fromDocuments(docs: DishDocument[]): DishEntity[] {
        return (docs ?? []).map(doc => this.fromDocument(doc));
    }
}

export class DishCommentFactory {

    static fromDocument(doc: DishCommentDocument): DishCommentEntity {
        return new DishCommentEntity(
            doc.dishId,
            doc.user,
            doc.text,
            doc.posted
        );
    }

    static fromDocuments(docs: DishCommentDocument[]): DishCommentEntity[] {
        return (docs ?? []).map(doc => this.fromDocument(doc));
    }
}