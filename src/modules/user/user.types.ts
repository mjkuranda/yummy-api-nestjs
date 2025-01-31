import { UserDocument } from '../../mongodb/documents/user.document';
import { UserAccessTokenPayload } from '../jwt-manager/jwt-manager.types';
import { DishDocument } from '../../mongodb/documents/dish.document';

export type CapabilityType = 'canAdd' | 'canEdit' | 'canDelete';

export type UserCapabilities = Record<CapabilityType, boolean>;

export type UserPermissions = Pick<UserDocument, 'isAdmin' | 'capabilities'>;

export type UserObject = Pick<UserDocument, 'email' | 'login' | 'isAdmin' | 'capabilities'> & { id: string };

export type AuthenticatedUserRequestBody<T> = { authenticatedUser: UserAccessTokenPayload, data: T };

export type UserProfile = Pick<UserDocument, 'login' | 'isAdmin' | 'capabilities' | 'activated'> & {
    dishList: Array<Pick<DishDocument, 'title'> & { id: string }>;
};