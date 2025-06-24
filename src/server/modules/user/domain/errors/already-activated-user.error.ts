export class AlreadyActivatedUserError extends Error {

    constructor(userId: string) {
        super(`User "${userId}" has already been activated in the past.`);
    }
}