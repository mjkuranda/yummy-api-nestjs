import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString, EncodedDishId } from '../../../../common/types';
import { DishEditDto } from '../../dish.dto';
import { DishIngredient } from '../../../ingredient/ingredient.types';
import { DishWriteService } from '../../write/dish-write.service';
import { LoggerService } from '../../../logger/logger.service';
import { Injectable } from '@nestjs/common';
import { DishNotFoundError } from '../../../../errors/domain/dish-not-found.error';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { InvalidDishIdError } from '../../../../errors/domain/invalid-dish-id.error';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';

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