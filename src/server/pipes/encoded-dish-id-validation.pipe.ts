import { PipeTransform, Injectable } from '@nestjs/common';
import { BadRequestException } from '../exceptions';
import { ContextString } from '../common/types';

@Injectable()
export class EncodedDishIdValidationPipe implements PipeTransform {

    private readonly expectedLength = 32;
    private readonly allowedPattern = /^[A-Za-z0-9\-_]+$/;

    transform(value: unknown): string {
        const context: ContextString = 'EncodedDishIdValidationPipe/transform';

        if (typeof value !== 'string') {
            throw new BadRequestException(context, 'Token must be a string');
        }

        if (value.length !== this.expectedLength) {
            throw new BadRequestException(context, `Token must be exactly ${this.expectedLength} characters long`);
        }

        if (!this.allowedPattern.test(value)) {
            throw new BadRequestException(context, 'Token contains invalid characters');
        }

        return value;
    }
}