import { UserDocument } from '../../../infrastructure/databases/mongodb/documents/user.document';
import { DishDocument } from '../../../infrastructure/databases/mongodb/documents/dish.document';

export type CapabilityType = 'canAdd' | 'canEdit' | 'canDelete';

export type UserCapabilities = Record<CapabilityType, boolean>;

export type UserPermissions = Pick<UserDocument, 'isAdmin' | 'capabilities'>;

export type UserObject = Pick<UserDocument, 'email' | 'login' | 'isAdmin' | 'capabilities'> & { id: string };

export type UserProfile = Pick<UserDocument, 'login' | 'isAdmin' | 'capabilities' | 'activated'> & {
    dishList: Array<Pick<DishDocument, 'title'> & { id: string }>;
};