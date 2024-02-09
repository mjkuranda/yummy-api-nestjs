export interface UserAccessTokenPayload {
    login: string;
    capabilities?: {
        canAdd?: boolean;
        canEdit?: boolean;
        canDelete?: boolean;
    }
    isAdmin?: boolean;
}

export interface UserRefreshTokenPayload {
    login: string;
}