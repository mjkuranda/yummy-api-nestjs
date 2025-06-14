import { UserActionEntity } from '../entities';
import { UserActionType } from '../../../../../infrastructure/databases/mongodb/documents/user-action.document';

export interface UserActionRepository {
    findById(id: string): Promise<UserActionEntity | null>;
    findByUserId(query: any): Promise<UserActionEntity | null>;
    create(userId: string, type: UserActionType): Promise<UserActionEntity>;
    delete(id: string): Promise<void>;
}