import { HttpException, HttpStatus } from '@nestjs/common';
import { ContextString } from '../common/types';

export class AbstractException extends HttpException {

    constructor(message: string,
                private readonly context: ContextString,
                private readonly statusCode: HttpStatus
    ) {
        super(message, statusCode);
    }

    public getContext(): ContextString {
        return this.context;
    }
}