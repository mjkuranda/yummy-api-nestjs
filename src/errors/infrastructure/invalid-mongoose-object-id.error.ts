export class InvalidMongooseObjectIdError extends Error {

    constructor(message: string) {
        super(message);
    }
}