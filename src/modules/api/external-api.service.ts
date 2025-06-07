import { Injectable } from '@nestjs/common';
import { SpoonacularApiService } from './spoonacular/spoonacular.api.service';
import { AbstractApiService } from '../../services/abstract.api.service';
import { RatedDish } from '../dish/dish.types';
import { MealType } from '../../common/enums';
import { Language } from '../../common/types';
import { DishDetailsWithMetadata } from '../dish/read/dish-read.types';
import { DishRecipe } from '../recipe/application/recipe-application.types';

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

    getDishDetails(id: string): Promise<DishDetailsWithMetadata>[] {
        return this.getAll().map(service => service.getDishDetails(id));
    }

    getDishRecipe(dishId: string, language: Language): Promise<DishRecipe | null>[] {
        return this.getAll().map(service => service.getDishRecipe(dishId, language));
    }
}