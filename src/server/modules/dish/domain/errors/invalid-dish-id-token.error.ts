export class InvalidDishIdTokenError extends Error {

    constructor() {
        super('Invalid or corrupted dish ID token');
    }

}