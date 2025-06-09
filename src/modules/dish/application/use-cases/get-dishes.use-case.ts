import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { IngredientType } from '../../../ingredient/ingredient.types';
import { MealType } from '../../../../common/enums';
import { RatedDish } from '../../dish.types';
import { IngredientService } from '../../../ingredient/ingredient.service';
import { DishReadService } from '../../read/dish-read.service';
import { LoggerService } from '../../../logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ContextString } from '../../../../common/types';
import { BadRequestException } from '../../../../exceptions';

@Injectable()
export class GetDishesUseCase extends AbstractUseCase<[IngredientType[], MealType], RatedDish[]> {

    constructor(
        private readonly ingredientService: IngredientService,
        private readonly dishReadService: DishReadService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    protected async run(ings: IngredientType[], mealType: MealType): Promise<RatedDish[]> {
        const filteredIngredients = this.ingredientService.filterIngredients(ings);
        const allIngredients = [...filteredIngredients, ...this.ingredientService.getAllPantryIngredients()];

        const { dishes, fromCache } = await this.dishReadService.getDishes(filteredIngredients, allIngredients, mealType);
        this.loggerService.info(this.context, `Returned ${dishes.length} dishes from ${fromCache ? 'cache' : 'provider and cached'}, defined for ingredients: ${filteredIngredients.join(', ')}.`);

        return dishes;
    }

    protected handleError(error: unknown, context: ContextString): never {
        throw new BadRequestException(context, 'Unknown error occurred');
    }

    protected get context(): ContextString {
        return 'GetDishesUseCase/run';
    }
}