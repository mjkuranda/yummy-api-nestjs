import { AbstractError } from './abstract.error';
import { ContextString } from '../common/types';

export class NotFoundError extends AbstractError {

    constructor(context: ContextString, message: string) {
        super(context, message);
    }
}