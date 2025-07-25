import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { DishReadService } from '../../domain/read/services';
import { LoggerService } from '../../../logger/logger.service';
import { DishNotFoundError, InvalidDishIdError } from '../../domain/errors';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { Injectable } from '@nestjs/common';
import { GetDishCommentsDto } from '../dtos';
import { DishCommentDtoMapper } from '../mappers';
import { DishTokenService } from '../../domain/common/services';

@Injectable()
export class GetDishCommentsUseCase extends AbstractUseCase<[string], GetDishCommentsDto> {

    constructor(
        private readonly dishTokenService: DishTokenService,
        private readonly loggerService: LoggerService,
        private readonly dishReadService: DishReadService
    ) {
        super();
    }

    protected async run(encodedDishId: string): Promise<GetDishCommentsDto> {
        const encodedDishIdVo = this.dishTokenService.decode(encodedDishId);
        const comments = await this.dishReadService.getDishComments(encodedDishIdVo);

        this.loggerService.info(this.context, `Successfully retrieved ${comments.length} comments for dish "${encodedDishId}".`);

        return DishCommentDtoMapper.toGetDishCommentsDto(encodedDishId, comments);
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