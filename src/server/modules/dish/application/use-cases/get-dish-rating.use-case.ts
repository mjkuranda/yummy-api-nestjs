import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { DishReadService } from '../../domain/read/dish-read.service';
import { LoggerService } from '../../../logger/logger.service';
import { DishNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { Injectable } from '@nestjs/common';
import { EncodedDishIdValueObject } from '../../domain/common/value-objects';
import { GetDishRatingDto } from '../dtos';
import { DishRatingDtoMapper } from '../mappers';

@Injectable()
export class GetDishRatingUseCase extends AbstractUseCase<[EncodedDishIdValueObject], GetDishRatingDto> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishReadService: DishReadService
    ) {
        super();
    }

    protected async run(encodedDishId: EncodedDishIdValueObject): Promise<GetDishRatingDto> {
        const rating = await this.dishReadService.getDishRating(encodedDishId);
        this.loggerService.info(this.context, `Calculated rating for dish "${encodedDishId}" on ${rating.ratingNumber}.`);

        return DishRatingDtoMapper.toGetDishRatingDto(rating);
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