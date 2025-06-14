import { UserActionDocument } from '../../../../../infrastructure/databases/mongodb/documents/user-action.document';

export class UserActionEntity {

    constructor(
        private readonly _id: string,
        private readonly _userId: string,
        private readonly _type: string
    ) {}

    static fromDocument(doc: UserActionDocument): UserActionEntity {
        return new UserActionEntity(
            doc._id,
            doc.userId,
            doc.type
        );
    }

    getId(): string {
        return this._id;
    }

    getUserId(): string {
        return this._userId;
    }
}