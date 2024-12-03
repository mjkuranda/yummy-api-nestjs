import { Inject, Injectable } from '@nestjs/common';
import { SpoonacularApiService } from '../modules/api/spoonacular/spoonacular.api.service';
import { AbstractApiService } from './abstract.api.service';
import { DetailedDish, RatedDish } from '../modules/dish/dish.types';

@Injectable()
export class ExternalApiService {
    constructor(
        @Inject() private spoonacularApiService: SpoonacularApiService
    ) {}

    getAll(): AbstractApiService<unknown, unknown, unknown, unknown>[] {
        return [
            this.spoonacularApiService
        ];
    }

    getDishes(ingredients: string[]): Promise<RatedDish[]>[] {
        return this.getAll().map(service => service.getDishes(ingredients));
    }

    getDishDetails(id: string): Promise<DetailedDish>[] {
        return this.getAll().map(service => service.getDishDetails(id));
    }
}