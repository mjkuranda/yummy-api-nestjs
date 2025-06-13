import { Injectable } from '@nestjs/common';
import { SpoonacularApiService } from './spoonacular/spoonacular.api.service';
import { AbstractApiService } from '../../services/abstract.api.service';
import { MealType } from '../../common/enums';
import { Language } from '../../common/types';
import { RecipeEntity } from '../recipe/domain/entities';
import { DishDetailsValueObject, DishResultValueObject } from '../dish/domain/read/value-objects';
import { EncodedDishIdValueObject } from '../dish/domain/common/value-objects';

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

    getDishes(ingredients: string[], mealType?: MealType): Promise<DishResultValueObject[]>[] {
        return this.getAll().map(service => service.getDishes(ingredients, mealType));
    }

    getDishDetails(encodedDishId: EncodedDishIdValueObject): Promise<DishDetailsValueObject>[] {
        return this.getAll().map(service => service.getDishDetails(encodedDishId));
    }

    getDishRecipe(encodedDishId: EncodedDishIdValueObject, language: Language): Promise<RecipeEntity | null>[] {
        return this.getAll().map(service => service.getDishRecipe(encodedDishId, language));
    }
}