import { HttpException, HttpStatus } from '@nestjs/common';
import { ContextString } from '../common/types';

export class AbstractException extends HttpException {

    constructor(
        private readonly context: ContextString,
        message: string,
        private readonly statusCode: HttpStatus
    ) {
        super(message, statusCode);
    }

    public getContext(): ContextString {
        return this.context;
    }
}