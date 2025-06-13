export interface UserAccessTokenPayload {
    login: string;
    expirationTimestamp: number;
    capabilities?: {
        canAdd?: boolean;
        canEdit?: boolean;
        canDelete?: boolean;
    }
    isAdmin?: boolean;
}

export type UserAccessTokenPayloadDto = Omit<UserAccessTokenPayload, 'expirationTimestamp'>;

export interface UserRefreshTokenPayload {
    login: string;
    expirationTimestamp: number;
}

export type UserRefreshTokenPayloadDto = Omit<UserRefreshTokenPayload, 'expirationTimestamp'>;