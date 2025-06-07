import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { UserDto } from '../../../user/user.dto';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../write/dish-write.service';
import { Injectable } from '@nestjs/common';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { InvalidDishIdError, DishNotFoundError } from '../../../../errors/domain';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { EncodedDishId } from '../../encoded-dish-id.value-object';

@Injectable()
export class ConfirmDishDeletionUseCase extends AbstractUseCase<[EncodedDishId, UserDto], boolean> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishWriteService: DishWriteService
    ) {
        super();
    }


    async execute(encodedDishId: EncodedDishId, user: UserDto): Promise<boolean> {
        const context = 'ConfirmDishDeletionUseCase/execute';

        try {
            const { wasDeleted, dishTitle } = await this.dishWriteService.confirmDeleting(encodedDishId);

            this.loggerService.info(context, `Confirmed dish deletion with id "${encodedDishId}" (titled: "${dishTitle}") by "${user.login}" user.`);

            return wasDeleted;
        } catch (error) {
            if (error instanceof InvalidDishIdError) {
                throw new BadRequestException(context, error.message);
            }

            if (error instanceof DishNotFoundError) {
                throw new NotFoundException(context, error.message);
            }
        }
    }
}