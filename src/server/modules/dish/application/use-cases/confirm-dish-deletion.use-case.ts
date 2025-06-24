import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { UserDto } from '../../../user/user.dto';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../domain/write/dish-write.service';
import { Injectable } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '../../../../exceptions';
import { InvalidDishIdError, DishNotFoundError } from '../../domain/errors';
import { ContextString } from '../../../../common/types';
import { ConfirmedDeletingDto } from '../dtos';
import { EncodedDishIdValueObject } from '../../domain/common/value-objects';

@Injectable()
export class ConfirmDishDeletionUseCase extends AbstractUseCase<[EncodedDishIdValueObject, UserDto], ConfirmedDeletingDto> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishWriteService: DishWriteService
    ) {
        super();
    }

    protected async run(encodedDishId: EncodedDishIdValueObject, user: UserDto): Promise<ConfirmedDeletingDto> {
        const valueObject = await this.dishWriteService.confirmDeleting(encodedDishId);
        const dishTitle = valueObject.getDishTitle();
        const wasDeleted = valueObject.wasDishDeleted();

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