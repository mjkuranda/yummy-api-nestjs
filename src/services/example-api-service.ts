import { AbstractApiService } from './abstract.api.service';
import { ApiName } from '../modules/redis/redis.types';
import { DetailedDish, DishRecipeSections, RatedDish } from '../modules/dish/dish.types';
import { DishIngredient, IngredientType } from '../modules/ingredient/ingredient.types';
import { Language } from '../common/types';
import { DishDetailsWithMetadata } from '../modules/dish/read/dish-read.types';
import { Provider, MealType } from '../common/enums';
import { EncodedDishId } from '../modules/dish/encoded-dish-id.value-object';

export class ExampleApiService extends AbstractApiService<any, any, any, any> {

    getApiUrl(): string {
        return 'api-url';
    }

    getName(): ApiName {
        return undefined;
    }

    getApiKey(): string {
        return 'my-key';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getDishDetails(encodedDishId: EncodedDishId): Promise<DishDetailsWithMetadata> {
        return {
            dishDetails: {} as DetailedDish,
            metadata: {}
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getDishes(ingredients: IngredientType[], mealType?: MealType): Promise<RatedDish[]> {
        return [];
    }

    getProvider(): Provider {
        return Provider.INT_DMT_USER;
    }

    getDishDetailsEndpointUrl(id: string): string {
        return `endpoint/${id}`;
    }

    getDishInstructionEndpointUrl(id: string): string {
        return `instruction-endpoint/${id}`;
    }

    getDishesEndpointUrl(): string {
        return 'dish-endpoint';
    }

    proceedDataToIngredientList(ingredients: any[]): IngredientType[] {
        return [...ingredients];
    }

    proceedDataToDishIngredients(ingredients: any[]): DishIngredient[] {
        return [...ingredients];
    }

    proceedDataToDishes(data: any[]): RatedDish[] {
        return [...data];
    }

    proceedDataToDishDetails(data: any): DetailedDish {
        return { ...data };
    }

    proceedDataToDishRecipeSections(instructionData: any): DishRecipeSections {
        return { ...instructionData };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getLanguage(encodedDishId: EncodedDishId): Language {
        return undefined;
    }

}