import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString, EncodedDishId } from '../../../../common/types';
import { DishCommentDocument } from '../../../../mongodb/documents/dish-comment.document';
import { DishReadService } from '../../read/dish-read.service';
import { LoggerService } from '../../../logger/logger.service';
import { DishNotFoundError } from '../../../../errors/domain/dish-not-found.error';
import { InvalidDishIdError } from '../../../../errors/domain/invalid-dish-id.error';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetDishCommentsUseCase extends AbstractUseCase<[EncodedDishId], DishCommentDocument[]> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishReadService: DishReadService
    ) {
        super();
    }

    async execute(encodedDishId: EncodedDishId): Promise<DishCommentDocument[]> {
        const context: ContextString = 'GetDishCommentsUseCase/execute';

        try {
            const comments = await this.dishReadService.getDishComments(encodedDishId);
            this.loggerService.info(context, `Successfully retrieved ${comments.length} comments for dish "${encodedDishId}".`);

            return comments;
        } catch (error) {
            if (error instanceof DishNotFoundError) {
                throw new NotFoundException(context, `Dish "${encodedDishId}" not found`);
            }

            if (error instanceof InvalidDishIdError) {
                throw new BadRequestException(context, `Invalid dish ID "${encodedDishId}"`);
            }
        }
    }
}