import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { DishRating } from '../../dish.types';
import { ContextString } from '../../../../common/types';
import { DishReadService } from '../../read/dish-read.service';
import { LoggerService } from '../../../logger/logger.service';
import { DishNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { Injectable } from '@nestjs/common';
import { EncodedDishId } from '../../encoded-dish-id.value-object';

@Injectable()
export class GetDishRatingUseCase extends AbstractUseCase<[EncodedDishId], DishRating> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishReadService: DishReadService
    ) {
        super();
    }

    async execute(encodedDishId: EncodedDishId): Promise<DishRating> {
        const context: ContextString = 'GetDishRatingUseCase/execute';

        try {
            const rating = await this.dishReadService.getDishRating(encodedDishId);
            this.loggerService.info(context, `Calculated rating for dish "${encodedDishId}" on ${rating.rating}.`);

            return rating;
        } catch (error) {
            if (error instanceof DishNotFoundError) {
                throw new NotFoundException(context, `Dish "${encodedDishId}" not found`);
            }

            if (error instanceof InvalidDishIdError) {
                throw new BadRequestException(context, `Invalid dish ID "${encodedDishId}"`);
            }
        }
    }
}