export class IncorrectUserCredentialsError extends Error {

    constructor(login: string) {
        super(`Incorrect credentials for user "${login}".`);
    }
}