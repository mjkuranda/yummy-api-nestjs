import { ContextString } from '../common/types';

export class AbstractError extends Error {

    constructor(
        private readonly context: ContextString,
        message: string
    ) {
        super(message);
    }

    public getContext(): ContextString {
        return this.context;
    }
}