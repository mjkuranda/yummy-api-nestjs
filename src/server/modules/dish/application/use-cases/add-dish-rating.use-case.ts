import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../domain/write/dish-write.service';
import { DishNotFoundError, InvalidDishIdError } from '../../domain/errors';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { Injectable } from '@nestjs/common';
import { AddedDishRatingDto } from '../dtos';
import { EncodedDishIdValueObject } from '../../domain/common/value-objects';

@Injectable()
export class AddDishRatingUseCase extends AbstractUseCase<[EncodedDishIdValueObject, string, number], AddedDishRatingDto> {

    constructor(
        private readonly dishWriteService: DishWriteService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    protected async run(encodedDishId: EncodedDishIdValueObject, userLogin: string, rating: number): Promise<AddedDishRatingDto> {
        const addDishRatingStatusValueObject = await this.dishWriteService.addDishRating(encodedDishId, userLogin, rating);

        if (!addDishRatingStatusValueObject.isNewRating()) {
            this.loggerService.info(this.context, `Successfully changed a rating for dish "${encodedDishId.getValue()}" by "${userLogin}" user.`);
        } else {
            this.loggerService.info(this.context, `Successfully added a new rating for dish "${encodedDishId.getValue()}" by "${userLogin}" user.`);
        }

        return new AddedDishRatingDto(
            addDishRatingStatusValueObject.isNewRating()
        );
    }

    protected handleError(err: unknown, context: ContextString): never {
        if (err instanceof DishNotFoundError) {
            throw new NotFoundException(context, err.message);
        }

        if (err instanceof InvalidDishIdError) {
            throw new BadRequestException(context, err.message);
        }

        throw err;
    }

    protected get context(): ContextString {
        return 'AddDishRatingUseCase/run';
    }
}