import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { UserDto } from '../../../user/user.dto';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../write/dish-write.service';
import { Injectable } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '../../../../exceptions';
import { InvalidDishIdError, DishNotFoundError } from '../../../../errors/domain';
import { EncodedDishId } from '../../encoded-dish-id.value-object';
import { ContextString } from '../../../../common/types';

@Injectable()
export class ConfirmDishDeletionUseCase extends AbstractUseCase<[EncodedDishId, UserDto], boolean> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishWriteService: DishWriteService
    ) {
        super();
    }

    protected async run(encodedDishId: EncodedDishId, user: UserDto): Promise<boolean> {
        const { wasDeleted, dishTitle } = await this.dishWriteService.confirmDeleting(encodedDishId);
        this.loggerService.info(this.context, `Confirmed dish deletion with id "${encodedDishId}" (titled: "${dishTitle}") by "${user.login}" user.`);

        return wasDeleted;
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