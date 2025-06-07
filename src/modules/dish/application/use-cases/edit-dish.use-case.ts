import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { DishEditDto } from '../../dish.dto';
import { DishIngredient } from '../../../ingredient/ingredient.types';
import { DishWriteService } from '../../write/dish-write.service';
import { LoggerService } from '../../../logger/logger.service';
import { Injectable } from '@nestjs/common';
import { DishNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { EncodedDishId } from '../../encoded-dish-id.value-object';

@Injectable()
export class EditDishUseCase extends AbstractUseCase<[EncodedDishId, DishEditDto<DishIngredient>], void> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishWriteService: DishWriteService
    ) {
        super();
    }

    async execute(encodedDishId: EncodedDishId, dishEditDto: DishEditDto<DishIngredient>): Promise<void> {
        const context: ContextString = 'EditDishUseCase/execute';

        try {
            const result = await this.dishWriteService.editDish(encodedDishId, dishEditDto);

            this.loggerService.info(context, `Dish with id "${encodedDishId}" (titled: "${result.dishTitle}") has been edited.`);
        } catch (error: unknown) {
            if (error instanceof DishNotFoundError) {
                throw new NotFoundException(context, error.message);
            }

            if (error instanceof InvalidDishIdError) {
                throw new BadRequestException(context, error.message);
            }
        }
    }
}