import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../domain/write/services';
import { DishNotFoundError, InvalidDishIdError } from '../../domain/errors';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { Injectable } from '@nestjs/common';
import { AddedDishRatingDto } from '../dtos';
import { DishTokenService } from '../../domain/common/services';

@Injectable()
export class AddDishRatingUseCase extends AbstractUseCase<[string, string, number], AddedDishRatingDto> {

    constructor(
        private readonly dishTokenService: DishTokenService,
        private readonly dishWriteService: DishWriteService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    protected async run(encodedDishId: string, userLogin: string, rating: number): Promise<AddedDishRatingDto> {
        const encodedDishIdVo = this.dishTokenService.decode(encodedDishId);
        const addDishRatingStatusVo = await this.dishWriteService.addDishRating(encodedDishIdVo, userLogin, rating);

        if (!addDishRatingStatusVo.isNewRating()) {
            this.loggerService.info(this.context, `Successfully changed a rating for dish "${encodedDishId}" by "${userLogin}" user.`);
        } else {
            this.loggerService.info(this.context, `Successfully added a new rating for dish "${encodedDishId}" by "${userLogin}" user.`);
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