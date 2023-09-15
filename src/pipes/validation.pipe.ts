import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BadRequestException } from '../exceptions/bad-request.exception';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {

    async transform(value: any, { metatype }: ArgumentMetadata) {
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }

        const object = plainToInstance(metatype, value);
        const errors = await validate(object);

        if (errors.length > 0) {
            throw new BadRequestException('ValidationPipe/transform', errors.join('|'));
        }

        return value;
    }

    private toValidate(metatype: Function): boolean {
        const types: Function[] = [String, Boolean, Number, Array, Object];

        return !types.includes(metatype);
    }
}