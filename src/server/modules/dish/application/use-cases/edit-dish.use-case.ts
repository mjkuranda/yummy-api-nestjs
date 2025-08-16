import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { EditDishDto } from '../dtos';
import { DishIngredient } from '../../../ingredient/ingredient.types';
import { DishWriteService } from '../../domain/write/services';
import { LoggerService } from '../../../logger/logger.service';
import { Injectable } from '@nestjs/common';
import { DishNotFoundError, InvalidDishIdError } from '../../domain/errors';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { EditDishVo } from '../../domain/write/vos';
import { DishTokenService } from '../../domain/common/services';

@Injectable()
export class EditDishUseCase extends AbstractUseCase<[string, EditDishDto<DishIngredient>], void> {

    constructor(
        private readonly dishTokenService: DishTokenService,
        private readonly dishWriteService: DishWriteService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    protected async run(encodedDishId: string, editDishDto: EditDishDto<DishIngredient>): Promise<void> {
        const encodedDishIdVo = this.dishTokenService.decode(encodedDishId);
        const editDishVo = EditDishVo.fromEditDishDto(editDishDto);
        const result = await this.dishWriteService.editDish(encodedDishIdVo, editDishVo);

        this.loggerService.info(this.context, `Dish with id "${encodedDishId}" (titled: "${result.dishTitle}") has been edited.`);
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
        return 'EditDishUseCase/run';
    }
}