import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../domain/write/dish-write.service';
import { DishNotFoundError, InvalidDishIdError, DishDeletionFailedError } from '../../domain/errors';
import { NotFoundException, BadRequestException, InternalServerException } from '../../../../exceptions';
import { Injectable } from '@nestjs/common';
import { ContextString } from '../../../../common/types';
import { EncodedDishIdVo } from '../../domain/common/vos';

@Injectable()
export class DeleteDishUseCase extends AbstractUseCase<[EncodedDishIdVo], boolean> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishWriteService: DishWriteService
    ) {
        super();
    }

    protected async run(encodedDishId: EncodedDishIdVo): Promise<boolean> {
        const result = await this.dishWriteService.deleteDish(encodedDishId);

        if (result.isSoftDeleted) {
            this.loggerService.info(this.context, `Dish with id "${encodedDishId}" (titled: "${result.dishTitle}") has been marked as soft-deleted.`);
        } else {
            this.loggerService.error(this.context, `Dish with id "${encodedDishId}" (titled: "${result.dishTitle}") has not been marked as soft-deleted.`);
        }

        return result.isSoftDeleted;
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof DishNotFoundError) {
            throw new NotFoundException(context, error.message);
        }

        if (error instanceof InvalidDishIdError) {
            throw new BadRequestException(context, error.message);
        }

        if (error instanceof DishDeletionFailedError) {
            throw new InternalServerException(context, error.message);
        }

        throw new BadRequestException(context, 'Unknown error occurred');
    }

    protected get context(): ContextString {
        return 'DeleteDishUseCase/run';
    }
}