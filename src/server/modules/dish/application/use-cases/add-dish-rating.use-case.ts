import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../domain/write/dish-write.service';
import { DishNotFoundError, InvalidDishIdError } from '../../domain/errors';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { Injectable } from '@nestjs/common';
import { AddedDishRatingDto } from '../dtos';
import { EncodedDishIdVo } from '../../domain/common/vos';

@Injectable()
export class AddDishRatingUseCase extends AbstractUseCase<[EncodedDishIdVo, string, number], AddedDishRatingDto> {

    constructor(
        private readonly dishWriteService: DishWriteService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    protected async run(encodedDishId: EncodedDishIdVo, userLogin: string, rating: number): Promise<AddedDishRatingDto> {
        const addDishRatingStatusVo = await this.dishWriteService.addDishRating(encodedDishId, userLogin, rating);

        if (!addDishRatingStatusVo.isNewRating()) {
            this.loggerService.info(this.context, `Successfully changed a rating for dish "${encodedDishId.getValue()}" by "${userLogin}" user.`);
        } else {
            this.loggerService.info(this.context, `Successfully added a new rating for dish "${encodedDishId.getValue()}" by "${userLogin}" user.`);
        }

        return new AddedDishRatingDto(
            addDishRatingStatusVo.isNewRating()
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