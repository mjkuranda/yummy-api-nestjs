import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { IngredientService } from '../../../ingredient/ingredient.service';
import { DishReadService } from '../../domain/read/services';
import { LoggerService } from '../../../logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ContextString } from '../../../../common/types';
import { BadRequestException } from '../../../../exceptions';
import { GetDishesQueryDto, GetDishResultsDto } from '../dtos';
import { DishResultsDtoMapper } from '../mappers';

@Injectable()
export class GetDishesUseCase extends AbstractUseCase<[GetDishesQueryDto], GetDishResultsDto> {

    constructor(
        private readonly ingredientService: IngredientService,
        private readonly dishReadService: DishReadService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    protected async run(getDishesQueryDto: GetDishesQueryDto): Promise<GetDishResultsDto> {
        const { ings, mealType } = getDishesQueryDto;
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