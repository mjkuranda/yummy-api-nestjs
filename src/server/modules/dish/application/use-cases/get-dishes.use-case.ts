import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { IngredientType } from '../../../ingredient/ingredient.types';
import { MealType } from '../../../../common/enums';
import { IngredientService } from '../../../ingredient/ingredient.service';
import { DishReadService } from '../../domain/read/dish-read.service';
import { LoggerService } from '../../../logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ContextString } from '../../../../common/types';
import { BadRequestException } from '../../../../exceptions';
import { GetDishResultsDto } from '../dtos';
import { DishResultsDtoMapper } from '../mappers';

@Injectable()
export class GetDishesUseCase extends AbstractUseCase<[IngredientType[], MealType], GetDishResultsDto> {

    constructor(
        private readonly ingredientService: IngredientService,
        private readonly dishReadService: DishReadService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    protected async run(ings: IngredientType[], mealType: MealType): Promise<GetDishResultsDto> {
        const filteredIngredients = this.ingredientService.filterIngredients(ings);
        const allIngredients = [...filteredIngredients, ...this.ingredientService.getAllPantryIngredients()];

        const { dishResultsVos, fromCache } = await this.dishReadService.getDishes(filteredIngredients, allIngredients, mealType);
        this.loggerService.info(this.context, `Returned ${dishResultsVos.length} dishes from ${fromCache ? 'cache' : 'provider and cached'}, defined for ingredients: ${filteredIngredients.join(', ')}.`);

        return DishResultsDtoMapper.toGetDishResultsDto(dishResultsVos);
    }

    protected handleError(error: unknown, context: ContextString): never {
        throw new BadRequestException(context, 'Unknown error occurred');
    }

    protected get context(): ContextString {
        return 'GetDishesUseCase/run';
    }
}