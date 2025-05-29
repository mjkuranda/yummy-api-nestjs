import { HttpStatus } from '@nestjs/common';
import { ContextString } from '../common/types';
import { AbstractException } from './abstract.exception';

export class InternalServerException extends AbstractException {

    constructor(context: ContextString, message: string) {
        super(context, message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}