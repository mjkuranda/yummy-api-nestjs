export type CapabilityType = 'canAdd' | 'canEdit' | 'canDelete';

export type UserCapabilities = Record<CapabilityType, boolean>;