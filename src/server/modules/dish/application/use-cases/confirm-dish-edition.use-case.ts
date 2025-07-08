import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../domain/write/dish-write.service';
import { DishNotFoundError, InvalidDishIdError } from '../../domain/errors';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { Injectable } from '@nestjs/common';
import { ContextString } from '../../../../common/types';
import { EncodedDishIdVo } from '../../domain/common/vos';
import { ConfirmedEditingDto } from '../dtos';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';

@Injectable()
export class ConfirmDishEditionUseCase extends AbstractUseCase<[EncodedDishIdVo, UserAccessTokenPayload], ConfirmedEditingDto> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishWrite: DishWriteService
    ) {
        super();
    }

    protected async run(encodedDishId: EncodedDishIdVo, userDto: UserAccessTokenPayload): Promise<ConfirmedEditingDto> {
        const result = await this.dishWrite.confirmEditing(encodedDishId);
        const title = result.getTitle();

        this.loggerService.info(this.context, `Dish edition for "${encodedDishId}" (titled: "${title}") has been confirmed by "${userDto.login}" user.`);

        return new ConfirmedEditingDto(result);
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