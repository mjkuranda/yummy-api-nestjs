import { DishId } from '../types';

export class InvalidMongooseIdTypeError extends Error {

    constructor(id: DishId) {
        super(`Invalid Mongoose ID type for "${id}".`);
    }

}