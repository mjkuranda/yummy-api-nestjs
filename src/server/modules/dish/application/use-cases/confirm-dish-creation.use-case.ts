import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { DishWriteService } from '../../domain/write/dish-write.service';
import { LoggerService } from '../../../logger/logger.service';
import { Injectable } from '@nestjs/common';
import { DishNotFoundError, InvalidDishIdError } from '../../domain/errors';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { EncodedDishIdValueObject } from '../../domain/common/value-objects';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';

@Injectable()
export class ConfirmDishCreationUseCase extends AbstractUseCase<[EncodedDishIdValueObject, UserAccessTokenPayload], void> {

    constructor(
        private readonly dishWriteService: DishWriteService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    protected async run(encodedDishId: EncodedDishIdValueObject, user: UserAccessTokenPayload): Promise<void> {
        const dishDetails = await this.dishWriteService.confirmCreating(encodedDishId);
        const title = dishDetails.getTitle();

        this.loggerService.info(this.context, `Dish with id "${encodedDishId}" (titled: "${title}") has been confirmed by "${user.login}" user and cached.`);
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