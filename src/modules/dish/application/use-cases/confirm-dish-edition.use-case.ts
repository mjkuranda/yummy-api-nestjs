import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { UserDto } from '../../../user/user.dto';
import { DishDocument } from '../../../../mongodb/documents/dish.document';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../domain/write/dish-write.service';
import { DishNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { Injectable } from '@nestjs/common';
import { EncodedDishId } from '../../domain/common/encoded-dish-id.value-object';
import { ContextString } from '../../../../common/types';

@Injectable()
export class ConfirmDishEditionUseCase extends AbstractUseCase<[EncodedDishId, UserDto], DishDocument> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishWrite: DishWriteService
    ) {
        super();
    }

    protected async run(encodedDishId: EncodedDishId, userDto: UserDto): Promise<DishDocument> {
        const result = await this.dishWrite.confirmEditing(encodedDishId);
        this.loggerService.info(this.context, `Dish edition for "${encodedDishId}" (titled: "${result.title}") has been confirmed by "${userDto.login}" user.`);

        return result;
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
        return 'ConfirmDishEditionUseCase/run';
    }
}