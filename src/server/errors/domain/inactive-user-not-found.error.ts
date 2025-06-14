export class InactiveUserNotFoundError extends Error {

    constructor(userId: string, userActionId: string) {
        super(`User with id "${userId}" does not exist, reported by "${userActionId}" request token for activation.`);
    }
}