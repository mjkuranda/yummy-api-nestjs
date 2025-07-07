import { DishDetailsValueObject, DishResultValueObject } from '../server/modules/dish/domain/read/value-objects';
import { DishRecipeSection } from '../server/modules/dish/dish.types';
import { DishIngredient } from '../server/modules/ingredient/ingredient.types';
import { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';

export interface ExternalApiDataAdaptable<ExternalApiDishResult, ExternalApiDishDetails, ExternalApiDishInstruction, ExternalApiDishIngredient> {
    toDishes: (data: ExternalApiDishResult[], providedIngredients?: string[]) => DishResultValueObject[];
    toDishDetails: (data: ExternalApiDishDetails) => DishDetailsValueObject;
    toDishRecipeSections: (instructionData: ExternalApiDishInstruction) => DishRecipeSection[];
    toDishIngredients: (ingredients: ExternalApiDishIngredient[]) => DishIngredient[];
}

export const EXTERNAL_API_ADAPTER_TOKEN: InjectionToken = 'EXTERNAL_API_ADAPTER_TOKEN';