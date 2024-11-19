import { UserDocument } from '../../mongodb/documents/user.document';

export type CapabilityType = 'canAdd' | 'canEdit' | 'canDelete';

export type UserCapabilities = Record<CapabilityType, boolean>;

export type UserPermissions = Pick<UserDocument, 'isAdmin' | 'capabilities'>;

export type UserObject = Pick<UserDocument, 'email' | 'login' | 'isAdmin' | 'capabilities'> & { id: string };