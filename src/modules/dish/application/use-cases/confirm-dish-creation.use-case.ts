import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { UserDto } from '../../../user/user.dto';
import { DishWriteService } from '../../write/dish-write.service';
import { LoggerService } from '../../../logger/logger.service';
import { Injectable } from '@nestjs/common';
import { DishNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { EncodedDishId } from '../../encoded-dish-id.value-object';

@Injectable()
export class ConfirmDishCreationUseCase extends AbstractUseCase<[EncodedDishId, UserDto], void> {

    constructor(
        private readonly dishWriteService: DishWriteService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    async execute(encodedDishId: EncodedDishId, user: UserDto): Promise<void> {
        const context: ContextString = 'ConfirmDishCreationUseCase/execute';

        try {
            const dishDetails = await this.dishWriteService.confirmCreating(encodedDishId);

            this.loggerService.info(context, `Dish with id "${encodedDishId}" (titled: "${dishDetails.title}") has been confirmed by "${user.login}" user and cached.`);
        } catch (error) {
            if (error instanceof DishNotFoundError) {
                throw new NotFoundException(context, error.message);
            }

            if (error instanceof InvalidDishIdError) {
                throw new BadRequestException(context, error.message);
            }
        }
    }
}