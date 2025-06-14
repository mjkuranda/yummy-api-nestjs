export class InactiveUserError extends Error {

    constructor(login: string) {
        super(`User "${login}" is not a valid account. You need to activate it first.`);
    }
}