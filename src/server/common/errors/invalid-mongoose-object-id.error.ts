export class InvalidMongooseObjectIdError extends Error {

    constructor(id: string) {
        super(`Provided "${id}" is not a correct MongoDB id.`);
    }
}