import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { DishReadService } from '../../domain/read/dish-read.service';
import { LoggerService } from '../../../logger/logger.service';
import { DishNotFoundError, InvalidDishIdError } from '../../domain/errors';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { Injectable } from '@nestjs/common';
import { EncodedDishIdValueObject } from '../../domain/common/value-objects';
import { GetDishCommentsDto } from '../dtos';
import { DishCommentDtoMapper } from '../mappers';

@Injectable()
export class GetDishCommentsUseCase extends AbstractUseCase<[EncodedDishIdValueObject], GetDishCommentsDto> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishReadService: DishReadService
    ) {
        super();
    }

    protected async run(encodedDishId: EncodedDishIdValueObject): Promise<GetDishCommentsDto> {
        const comments = await this.dishReadService.getDishComments(encodedDishId);
        this.loggerService.info(this.context, `Successfully retrieved ${comments.length} comments for dish "${encodedDishId}".`);

        return DishCommentDtoMapper.toGetDishCommentsDto(comments);
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
        return 'GetDishCommentsUseCase/run';
    }
}