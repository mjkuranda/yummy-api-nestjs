import { Injectable, PipeTransform } from '@nestjs/common';
import { BadRequestException } from '../exceptions/bad-request.exception';
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

        if (!value.ings) {
            const message = 'No provided ingredients in query.';
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const ings = value.ings.split(',').filter(ing => ing.length > 0);

        if (ings.length === 0) {
            const message = 'Provided 0 ingredients in query.';
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        return value;
    }
}