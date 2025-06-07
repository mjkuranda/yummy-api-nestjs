import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../write/dish-write.service';
import { DishNotFoundError, InvalidDishIdError, DishDeletionFailedError } from '../../../../errors/domain';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { Injectable } from '@nestjs/common';
import { InternalServerException } from '../../../../exceptions/internal-server.exception';
import { EncodedDishId } from '../../encoded-dish-id.value-object';

@Injectable()
export class DeleteDishUseCase extends AbstractUseCase<[EncodedDishId], boolean> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishWriteService: DishWriteService
    ) {
        super();
    }

    async execute(encodedDishId: EncodedDishId): Promise<boolean> {
        const context = 'DeleteDishUseCase/execute';

        try {
            const result = await this.dishWriteService.deleteDish(encodedDishId);

            if (result.isSoftDeleted) {
                this.loggerService.info(context, `Dish with id "${encodedDishId}" (titled: "${result.dishTitle}") has been marked as soft-deleted.`);
            } else {
                this.loggerService.error(context, `Dish with id "${encodedDishId}" (titled: "${result.dishTitle}") has not been marked as soft-deleted.`);
            }

            return result.isSoftDeleted;
        } catch (error) {
            if (error instanceof DishNotFoundError) {
                throw new NotFoundException(context, `Dish "${encodedDishId}" not found`);
            }

            if (error instanceof InvalidDishIdError) {
                throw new BadRequestException(context, `Invalid dish ID "${encodedDishId}"`);
            }

            if (error instanceof DishDeletionFailedError) {
                throw new InternalServerException(context, `Failed to delete dish "${encodedDishId}"`);
            }
        }
    }
}