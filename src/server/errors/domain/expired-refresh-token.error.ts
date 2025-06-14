export class ExpiredRefreshTokenError extends Error {

    constructor(userLogin: string) {
        super(`Refresh token for user "${userLogin}" has expired.`);
    }
}