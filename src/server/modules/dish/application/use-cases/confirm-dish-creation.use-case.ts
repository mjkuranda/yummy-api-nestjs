import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { DishWriteService } from '../../domain/write/services';
import { LoggerService } from '../../../logger/logger.service';
import { Injectable } from '@nestjs/common';
import { DishNotFoundError, InvalidDishIdError } from '../../domain/errors';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { DishTokenService } from '../../domain/common/services';
import { DishCacheService } from '../../../cache/domains/dish/dish-cache.service';

@Injectable()
export class ConfirmDishCreationUseCase extends AbstractUseCase<[string, UserAccessTokenPayload], void> {

    constructor(
        private readonly dishTokenService: DishTokenService,
        private readonly dishCacheService: DishCacheService,
        private readonly dishWriteService: DishWriteService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    protected async run(encodedDishId: string, user: UserAccessTokenPayload): Promise<void> {
        const encodedDishIdVo = this.dishTokenService.decode(encodedDishId);
        const dishDetails = await this.dishWriteService.confirmCreating(encodedDishIdVo);
        await this.dishCacheService.setDishDetails(encodedDishIdVo, dishDetails);

        this.loggerService.info(this.context, `Dish with id "${encodedDishId}" (titled: "${dishDetails.title}") has been confirmed by "${user.login}" user and cached.`);
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
        return 'ConfirmDishCreationUseCase/run';
    }
}