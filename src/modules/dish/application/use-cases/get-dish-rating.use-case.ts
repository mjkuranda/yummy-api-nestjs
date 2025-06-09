import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { DishRating } from '../../dish.types';
import { ContextString } from '../../../../common/types';
import { DishReadService } from '../../domain/read/dish-read.service';
import { LoggerService } from '../../../logger/logger.service';
import { DishNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
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

    protected async run(encodedDishId: EncodedDishId): Promise<DishRating> {
        const rating = await this.dishReadService.getDishRating(encodedDishId);
        this.loggerService.info(this.context, `Calculated rating for dish "${encodedDishId}" on ${rating.rating}.`);

        return rating;
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof DishNotFoundError) {
            throw new NotFoundException(context, error.message);
        }

        if (error instanceof InvalidDishIdError) {
            throw new BadRequestException(context, error.message);
        }

        throw new BadRequestException(context, 'Unknown error occurred');
    }

    protected get context(): ContextString {
        return 'GetDishRatingUseCase/run';
    }
}