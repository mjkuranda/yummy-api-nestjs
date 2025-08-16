import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../domain/write/services';
import { DishNotFoundError, InvalidDishIdError } from '../../domain/errors';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { Injectable } from '@nestjs/common';
import { ContextString } from '../../../../common/types';
import { DishTokenService } from '../../domain/common/services';
import { DishCacheService } from '../../../cache/domains/dish/dish-cache.service';

@Injectable()
export class DeleteDishUseCase extends AbstractUseCase<[string], boolean> {

    constructor(
        private readonly dishTokenService: DishTokenService,
        private readonly dishCacheService: DishCacheService,
        private readonly dishWriteService: DishWriteService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    protected async run(encodedDishId: string): Promise<boolean> {
        const encodedDishIdVo = this.dishTokenService.decode(encodedDishId);
        const result = await this.dishWriteService.deleteDish(encodedDishIdVo);
        await this.dishCacheService.deleteDish(encodedDishIdVo);

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

        throw new BadRequestException(context, 'Unknown error occurred');
    }

    protected get context(): ContextString {
        return 'DeleteDishUseCase/run';
    }
}