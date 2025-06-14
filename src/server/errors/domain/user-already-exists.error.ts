export class UserAlreadyExistsError extends Error {

    constructor(userLogin: string) {
        super(`User with "${userLogin}" login has already exists.`);
    }

}