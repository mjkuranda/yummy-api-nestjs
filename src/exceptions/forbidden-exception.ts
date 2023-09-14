import { HttpStatus } from '@nestjs/common';
import { ContextString } from '../common/types';
import { AbstractException } from './abstract.exception';

export class ForbiddenException extends AbstractException {

    constructor(context: ContextString, message: string) {
        super(context, message, HttpStatus.FORBIDDEN);
    }
}