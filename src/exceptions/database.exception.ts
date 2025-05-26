import { AbstractException } from './abstract.exception';
import { ContextString } from '../common/types';
import { HttpStatus } from '@nestjs/common';

export class DatabaseException extends AbstractException {

    constructor(context: ContextString, message: string) {
        super(context, message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}