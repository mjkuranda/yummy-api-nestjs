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

    async execute(createCommentBody: CreateDishCommentBody, user: string): Promise<void> {
        const context: ContextString = 'AddDishCommentUseCase/execute';

        try {
            await this.dishWriteService.addDishComment(createCommentBody, user);

            this.loggerService.info(context, `Successfully added a new comment to dish "${createCommentBody.encodedDishId}" by "${user}" user.`);
        } catch (error) {
            if (error instanceof DishNotFoundError) {
                throw new NotFoundException(context, `Dish "${createCommentBody.encodedDishId}" not found`);
            }

            if (error instanceof DishNotAcceptedError) {
                throw new ForbiddenException(context, `Dish "${createCommentBody.encodedDishId}" has not been accepted`);
            }

            if (error instanceof DishSoftDeletedError) {
                throw new ForbiddenException(context, `Dish "${createCommentBody.encodedDishId}" has been deleted`);
            }
        }
    }
}