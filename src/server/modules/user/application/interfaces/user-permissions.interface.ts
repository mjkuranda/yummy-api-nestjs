export interface UserPermissions {
    isAdmin?: boolean;
    capabilities?: Record<string, boolean>;
}