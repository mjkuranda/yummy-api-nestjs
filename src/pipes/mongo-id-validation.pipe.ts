import { PipeTransform, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { LoggerService } from '../modules/logger/logger.service';
import { BadRequestException } from '../exceptions/bad-request.exception';
import { ContextString } from '../common/types';

@Injectable()
export class MongoIdValidationPipe implements PipeTransform<string, ObjectId> {

    constructor(private readonly loggerService: LoggerService) {}

    transform(value: string): ObjectId {
        const context: ContextString = 'MongoIdValidationPipe/transform';

        if (!ObjectId.isValid(value)) {
            const message = `Invalid MongoDB ObjectId: ${value}`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        return new ObjectId(value);
    }
}