import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { CreateDishRatingBody } from '../../dish.dto';
import { DishRatingDocument } from '../../../../mongodb/documents/dish-rating.document';
import { ContextString } from '../../../../common/types';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../write/dish-write.service';
import { DishNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AddDishRatingUseCase extends AbstractUseCase<[CreateDishRatingBody, string], DishRatingDocument> {

    constructor(
        private readonly dishWriteService: DishWriteService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    protected async run(createRatingBody: CreateDishRatingBody, user: string): Promise<DishRatingDocument> {
        const { dishRating, isNew } = await this.dishWriteService.addDishRating(createRatingBody, user);

        if (!isNew) {
            this.loggerService.info(this.context, `Successfully changed a rating for dish "${createRatingBody.encodedDishId}" by "${user}" user.`);
        } else {
            this.loggerService.info(this.context, `Successfully added a new rating for dish "${createRatingBody.encodedDishId}" by "${user}" user.`);
        }

        return dishRating;
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