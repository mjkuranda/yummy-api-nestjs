export class InvalidMongooseIdError extends Error {

    constructor(message: string) {
        super(message);
    }
}