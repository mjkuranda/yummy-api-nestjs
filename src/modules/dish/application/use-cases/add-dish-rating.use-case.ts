import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { CreateDishRatingBody } from '../../dish.dto';
import { DishRatingDocument } from '../../../../mongodb/documents/dish-rating.document';
import { ContextString } from '../../../../common/types';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../write/dish-write.service';
import { DishNotFoundError } from '../../../../errors/domain/dish-not-found.error';
import { InvalidDishIdError } from '../../../../errors/domain/invalid-dish-id.error';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AddDishRatingUseCase extends AbstractUseCase<[CreateDishRatingBody, string], DishRatingDocument> {

    constructor(
        private readonly dishWriteService: DishWriteService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    async execute(createRatingBody: CreateDishRatingBody, user: string): Promise<DishRatingDocument> {
        const context: ContextString = 'AddDishRatingUseCase/execute';

        try {
            const { dishRating, isNew } = await this.dishWriteService.addDishRating(createRatingBody, user);

            if (!isNew) {
                this.loggerService.info(context, `Successfully changed a rating for dish "${createRatingBody.encodedDishId}" by "${user}" user.`);
            } else {
                this.loggerService.info(context, `Successfully added a new rating for dish "${createRatingBody.encodedDishId}" by "${user}" user.`);
            }

            return dishRating;
        } catch (error) {
            if (error instanceof DishNotFoundError) {
                throw new NotFoundException(context, `Dish "${createRatingBody.encodedDishId}" not found`);
            }

            if (error instanceof InvalidDishIdError) {
                throw new BadRequestException(context, `Invalid dish ID "${createRatingBody.encodedDishId}"`);
            }
        }
    }
}