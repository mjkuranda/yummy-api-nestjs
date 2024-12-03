import { Injectable } from '@nestjs/common';
import { SpoonacularApiService } from './spoonacular/spoonacular.api.service';
import { AbstractApiService } from '../../services/abstract.api.service';
import { DetailedDish, RatedDish } from '../dish/dish.types';
import { MealType } from '../../common/enums';

@Injectable()
export class ExternalApiService {
    constructor(
        private spoonacularApiService: SpoonacularApiService
    ) {}

    getAll(): AbstractApiService<unknown, unknown, unknown, unknown>[] {
        return [
            this.spoonacularApiService
        ];
    }

    getDishes(ingredients: string[], mealType?: MealType): Promise<RatedDish[]>[] {
        return this.getAll().map(service => service.getDishes(ingredients, mealType));
    }

    getDishDetails(id: string): Promise<DetailedDish>[] {
        return this.getAll().map(service => service.getDishDetails(id));
    }
}