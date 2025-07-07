import { Injectable, PipeTransform } from '@nestjs/common';
import { BadRequestException } from '../exceptions';
import { ContextString } from '../common/types';
import { LoggerService } from '../modules/logger/logger.service';

const allowedQueryKeyTypes = ['ings', 'type', 'dish'] as const;

type AllowedQueryKeyType = typeof allowedQueryKeyTypes[number];

@Injectable()
export class DishQueryValidationPipe implements PipeTransform {

    constructor(private readonly loggerService: LoggerService) {}

    async transform(value: Record<string, unknown>): Promise<Record<AllowedQueryKeyType, unknown>> {
        const context: ContextString = 'DishQueryValidationPipe/transform';

        if (!value || Object.keys(value).length === 0) {
            const message = 'No query defined in your request.';
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        if (typeof value.ings !== 'string' || value.ings === '') {
            const message = '`ings` query param must be a comma-separated string.';
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        return {
            ings: value.ings,
            ...(value.type && { type: value.type }),
            ...(value.dish && { dish: value.dish })
        };
    }
}