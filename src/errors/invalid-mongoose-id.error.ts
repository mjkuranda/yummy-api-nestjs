import { AbstractError } from './abstract.error';
import { ContextString } from '../common/types';

export class InvalidMongooseIdError extends AbstractError {

    constructor(context: ContextString, message: string) {
        super(context, message);
    }
}