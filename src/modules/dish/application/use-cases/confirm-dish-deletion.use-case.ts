import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { EncodedDishId } from '../../../../common/types';
import { UserDto } from '../../../user/user.dto';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../write/dish-write.service';
import { Injectable } from '@nestjs/common';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { InvalidDishIdError } from '../../../../errors/domain/invalid-dish-id.error';
import { DishNotFoundError } from '../../../../errors/domain/dish-not-found.error';
import { NotFoundException } from '../../../../exceptions/not-found.exception';

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