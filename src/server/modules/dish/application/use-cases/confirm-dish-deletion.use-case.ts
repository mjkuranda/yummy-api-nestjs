import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../domain/write/services';
import { Injectable } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '../../../../exceptions';
import { InvalidDishIdError, DishNotFoundError } from '../../domain/errors';
import { ContextString } from '../../../../common/types';
import { ConfirmedDeletingDto } from '../dtos';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { DishTokenService } from '../../domain/common/services';
import { DishCacheService } from '../../../cache/domains/dish/dish-cache.service';

@Injectable()
export class ConfirmDishDeletionUseCase extends AbstractUseCase<[string, UserAccessTokenPayload], ConfirmedDeletingDto> {

    constructor(
        private readonly dishTokenService: DishTokenService,
        private readonly dishCacheService: DishCacheService,
        private readonly dishWriteService: DishWriteService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    protected async run(encodedDishId: string, user: UserAccessTokenPayload): Promise<ConfirmedDeletingDto> {
        const encodedDishIdVo = this.dishTokenService.decode(encodedDishId);
        const dishDeletionConfirmationStatusVo = await this.dishWriteService.confirmDeleting(encodedDishIdVo);
        await this.dishCacheService.deleteDish(encodedDishIdVo);
        const dishTitle = dishDeletionConfirmationStatusVo.getDishTitle();
        const wasDeleted = dishDeletionConfirmationStatusVo.wasDishDeleted();

        this.loggerService.info(this.context, `Confirmed dish deletion with id "${encodedDishId}" (titled: "${dishTitle}") by "${user.login}" user.`);

        return new ConfirmedDeletingDto(wasDeleted);
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof InvalidDishIdError) {
            throw new BadRequestException(context, error.message);
        }

        if (error instanceof DishNotFoundError) {
            throw new NotFoundException(context, error.message);
        }

        throw new BadRequestException(context, 'Unknown error occurred');
    }

    protected get context(): ContextString {
        return 'ConfirmDishDeletionUseCase/run';
    }
}