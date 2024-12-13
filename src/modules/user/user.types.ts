import { UserDocument } from '../../mongodb/documents/user.document';
import { UserAccessTokenPayload } from '../jwt-manager/jwt-manager.types';

export type CapabilityType = 'canAdd' | 'canEdit' | 'canDelete';

export type UserCapabilities = Record<CapabilityType, boolean>;

export type UserPermissions = Pick<UserDocument, 'isAdmin' | 'capabilities'>;

export type UserObject = Pick<UserDocument, 'email' | 'login' | 'isAdmin' | 'capabilities'> & { id: string };

export type AuthenticatedUserRequestBody<T> = { authenticatedUser: UserAccessTokenPayload, data: T };