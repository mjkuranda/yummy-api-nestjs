import { Injectable } from '@nestjs/common';
import { DishSourceRegistryService } from '../source/dish-source-registry.service';
import { RatedDish } from '../dish.types';
import { getFulfilledPromiseResults } from '../../../utils';
import { MealType } from '../../../common/enums';
import { filterByMealType, filterGreaterThanZeroRelevance, sortDescendingRelevance } from '../rated-dish.helpers';

@Injectable()
export class DishAggregatorService {

    constructor(private readonly dishSourceRegistryService: DishSourceRegistryService) {}

    /**
     * @description Returns aggregated dishes by ingredients and meal type optionally
     * @param ingredients ingredients provided by user
     * @param mealType filter dishes by meal type
     */
    async aggregateRatedDishes(ingredients: string[], mealType?: MealType): Promise<RatedDish[]> {
        const providers = this.dishSourceRegistryService.getAllProviders();
        const promises = providers.map(provider => provider.getDishes(ingredients));
        const datasets = await this.getDatasets(...promises);

        return datasets
            .flat()
            .filter(dish =>
                filterGreaterThanZeroRelevance(dish) &&
                filterByMealType(dish, mealType))
            .sort(sortDescendingRelevance);
    }

    private getDatasets<T>(...datasets: Promise<T>[]): Promise<T[]> {
        return getFulfilledPromiseResults<T>(datasets);
    }
}