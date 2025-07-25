import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { DishReadService } from '../../domain/read/services';
import { LoggerService } from '../../../logger/logger.service';
import { DishNotFoundError, InvalidDishIdError } from '../../domain/errors';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { Injectable } from '@nestjs/common';
import { GetDishRatingDto } from '../dtos';
import { DishRatingDtoMapper } from '../mappers';
import { DishTokenService } from '../../domain/common/services';

@Injectable()
export class GetDishRatingUseCase extends AbstractUseCase<[string], GetDishRatingDto> {

    constructor(
        private readonly dishTokenService: DishTokenService,
        private readonly loggerService: LoggerService,
        private readonly dishReadService: DishReadService
    ) {
        super();
    }

    protected async run(encodedDishId: string): Promise<GetDishRatingDto> {
        const encodedDishIdVo = this.dishTokenService.decode(encodedDishId);
        const rating = await this.dishReadService.getDishRating(encodedDishIdVo);
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