import { HttpStatus } from '@nestjs/common';
import { ContextString } from '../common/types';
import { AbstractException } from './abstract.exception';

export class BadRequestException extends AbstractException {

    constructor(message: string, context: ContextString) {
        super(message, context, HttpStatus.BAD_REQUEST);
    }
}