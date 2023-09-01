import { HttpStatus } from '@nestjs/common';
import { ContextString } from '../common/types';
import { AbstractException } from './abstract.exception';

export class NotFoundException extends AbstractException {

    constructor(message: string, context: ContextString) {
        super(message, context, HttpStatus.NOT_FOUND);
    }
}