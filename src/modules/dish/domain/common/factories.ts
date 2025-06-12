import { DishDocument } from '../../../../mongodb/documents/dish.document';
import { DishCommentEntity, DishEntity } from './entities';
import { DishCommentDocument } from '../../../../mongodb/documents/dish-comment.document';

export class DishFactory {

    static fromDocument(doc: DishDocument): DishEntity {
        return new DishEntity({
            author: doc.author,
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