export class MismatchedUserTokensError extends Error {

    constructor(userLogin: string) {
        super(`User tokens mismatched for "${userLogin}".`);
    }
}