import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../domain/write/dish-write.service';
import { DishNotFoundError, DishNotAcceptedError, DishSoftDeletedError } from '../../domain/errors';
import { NotFoundException, ForbiddenException } from '../../../../exceptions';
import { Injectable } from '@nestjs/common';
import { EncodedDishIdValueObject } from '../../domain/common/value-objects';
import { DishCommentDto } from '../dtos';

@Injectable()
export class AddDishCommentUseCase extends AbstractUseCase<[EncodedDishIdValueObject, string, string], void> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishWriteService: DishWriteService
    ) {
        super();
    }

    protected async run(encodedDishId: EncodedDishIdValueObject, userLogin: string, content: string): Promise<void> {
        await this.dishWriteService.addDishComment(encodedDishId, userLogin, content);

        this.loggerService.info(this.context, `Successfully added a new comment to dish "${encodedDishId.getValue()}" by "${userLogin}" user.`);
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof DishNotFoundError) {
            throw new NotFoundException(context, error.message);
        }

        if (error instanceof DishNotAcceptedError) {
            throw new ForbiddenException(context, error.message);
        }

        if (error instanceof DishSoftDeletedError) {
            throw new ForbiddenException(context, error.message);
        }

        throw error;
    }

    protected get context(): ContextString {
        return 'AddDishCommentUseCase/run';
    }
}