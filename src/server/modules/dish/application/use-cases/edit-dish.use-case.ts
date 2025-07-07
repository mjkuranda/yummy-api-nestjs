import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { EditDishDto } from '../dtos';
import { DishIngredient } from '../../../ingredient/ingredient.types';
import { DishWriteService } from '../../domain/write/dish-write.service';
import { LoggerService } from '../../../logger/logger.service';
import { Injectable } from '@nestjs/common';
import { DishNotFoundError, InvalidDishIdError } from '../../domain/errors';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { EncodedDishIdValueObject } from '../../domain/common/value-objects';

@Injectable()
export class EditDishUseCase extends AbstractUseCase<[EncodedDishIdValueObject, EditDishDto<DishIngredient>], void> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishWriteService: DishWriteService
    ) {
        super();
    }

    protected async run(encodedDishId: EncodedDishIdValueObject, editDishDto: EditDishDto<DishIngredient>): Promise<void> {
        const result = await this.dishWriteService.editDish(encodedDishId, editDishDto);
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