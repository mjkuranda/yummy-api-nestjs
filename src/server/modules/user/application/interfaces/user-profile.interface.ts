export interface UserProfile {
    login: string;
    isAdmin: boolean;
    capabilities: Record<string, boolean>;
    activated: number;
    dishList: Array<{
        title: string;
        userLogin: string;
    }>;
}