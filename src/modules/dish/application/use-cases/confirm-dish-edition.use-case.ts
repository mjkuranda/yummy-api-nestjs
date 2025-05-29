import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { UserDto } from '../../../user/user.dto';
import { DishDocument } from '../../../../mongodb/documents/dish.document';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../write/dish-write.service';
import { EncodedDishId } from '../../../../common/types';
import { DishNotFoundError } from '../../../../errors/domain/dish-not-found.error';
import { InvalidDishIdError } from '../../../../errors/domain/invalid-dish-id.error';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfirmDishEditionUseCase extends AbstractUseCase<[EncodedDishId, UserDto], DishDocument> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishWrite: DishWriteService
    ) {
        super();
    }

    async execute(encodedDishId: EncodedDishId, userDto: UserDto): Promise<DishDocument> {
        const context = 'ConfirmDishEditionUseCase/execute';

        try {
            const result = await this.dishWrite.confirmEditing(encodedDishId);
            this.loggerService.info(context, `Dish edition for "${encodedDishId}" (titled: "${result.title}") has been confirmed by "${userDto.login}" user.`);

            return result;
        } catch (error) {
            if (error instanceof DishNotFoundError) {
                throw new NotFoundException(context, `Dish "${encodedDishId}" not found`);
            }

            if (error instanceof InvalidDishIdError) {
                throw new BadRequestException(context, `Invalid dish ID "${encodedDishId}"`);
            }
        }
    }
}