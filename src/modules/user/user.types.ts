import { UserDocument } from '../../mongodb/documents/user.document';

export type CapabilityType = 'canAdd' | 'canEdit' | 'canRemove';

export type UserPermissions = Pick<UserDocument, 'isAdmin' | 'capabilities'>;