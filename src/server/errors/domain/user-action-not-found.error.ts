export class UserActionNotFoundError extends Error {

    constructor(userActionId: string) {
        super(`Not found any request with "${userActionId}" activation token.`);
    }

}