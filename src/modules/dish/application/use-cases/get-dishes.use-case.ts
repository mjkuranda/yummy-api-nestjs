import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { IngredientType } from '../../../ingredient/ingredient.types';
import { MealType } from '../../../../common/enums';
import { RatedDish } from '../../dish.types';
import { IngredientService } from '../../../ingredient/ingredient.service';
import { DishReadService } from '../../read/dish-read.service';
import { LoggerService } from '../../../logger/logger.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetDishesUseCase extends AbstractUseCase<[IngredientType[], MealType], RatedDish[]> {

    constructor(
        private readonly ingredientService: IngredientService,
        private readonly dishReadService: DishReadService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    async execute(ings: IngredientType[], mealType: MealType): Promise<RatedDish[]> {
        const context = 'GetDishesUseCase/execute';
        const filteredIngredients = this.ingredientService.filterIngredients(ings);
        const allIngredients = [...filteredIngredients, ...this.ingredientService.getAllPantryIngredients()];

        const { dishes, fromCache } = await this.dishReadService.getDishes(filteredIngredients, allIngredients, mealType);
        this.loggerService.info(context, `Returned ${dishes.length} dishes from ${fromCache ? 'cache' : 'provider and cached'}, defined for ingredients: ${filteredIngredients.join(', ')}.`);

        return dishes;
    }
}