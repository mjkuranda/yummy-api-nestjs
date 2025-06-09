import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { DishCommentDocument } from '../../../../mongodb/documents/dish-comment.document';
import { DishReadService } from '../../domain/read/dish-read.service';
import { LoggerService } from '../../../logger/logger.service';
import { DishNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { Injectable } from '@nestjs/common';
import { EncodedDishId } from '../../encoded-dish-id.value-object';

@Injectable()
export class GetDishCommentsUseCase extends AbstractUseCase<[EncodedDishId], DishCommentDocument[]> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishReadService: DishReadService
    ) {
        super();
    }

    protected async run(encodedDishId: EncodedDishId): Promise<DishCommentDocument[]> {
        const comments = await this.dishReadService.getDishComments(encodedDishId);
        this.loggerService.info(this.context, `Successfully retrieved ${comments.length} comments for dish "${encodedDishId}".`);

        return comments;
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