export class UserWithLoginNotFoundError extends Error {

    constructor(login: string) {
        super(`User with login "${login}" does not exist.`);
    }
}