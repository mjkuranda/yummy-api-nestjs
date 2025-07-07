import { Injectable, PipeTransform } from '@nestjs/common';
import { BadRequestException } from '../exceptions';
import { GetDishesQueryType } from '../modules/dish/dish.types';
import { ContextString } from '../common/types';
import { LoggerService } from '../modules/logger/logger.service';

@Injectable()
export class DishQueryValidationPipe implements PipeTransform {

    constructor(private readonly loggerService: LoggerService) {}

    async transform(value: GetDishesQueryType): Promise<GetDishesQueryType> {
        const context: ContextString = 'DishQueryValidationPipe/transform';

        if (!value || Object.keys(value).length === 0) {
            const message = 'No query defined in your request.';
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        if (typeof value.ings !== 'string') {
            const message = '`ings` query param must be a comma-separated string.';
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        return value;
    }
}