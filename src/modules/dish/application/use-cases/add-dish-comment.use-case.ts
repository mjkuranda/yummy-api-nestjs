import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { CreateDishCommentBody } from '../../dish.dto';
import { ContextString } from '../../../../common/types';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../write/dish-write.service';
import { DishNotFoundError, DishNotAcceptedError, DishSoftDeletedError } from '../../../../errors/domain';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { ForbiddenException } from '../../../../exceptions/forbidden-exception';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AddDishCommentUseCase extends AbstractUseCase<[CreateDishCommentBody, string], void> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishWriteService: DishWriteService
    ) {
        super();
    }

    protected async run(createCommentBody: CreateDishCommentBody, user: string): Promise<void> {
        await this.dishWriteService.addDishComment(createCommentBody, user);
        this.loggerService.info(this.context, `Successfully added a new comment to dish "${createCommentBody.encodedDishId}" by "${user}" user.`);
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