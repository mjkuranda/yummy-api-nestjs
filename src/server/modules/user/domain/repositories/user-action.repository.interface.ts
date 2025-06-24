import { UserActionEntity } from '../entities';
import { UserActionType } from '../../../../../infrastructure/databases/mongodb/documents';

export interface UserActionRepository {
    findActionById(id: string): Promise<UserActionEntity | null>;
    findActionByUserId(userId: string): Promise<UserActionEntity | null>;
    createAction(userId: string, type: UserActionType): Promise<UserActionEntity>;
    deleteAction(id: string): Promise<void>;
}