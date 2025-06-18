import { DishDetailsValueObject, DishResultValueObject } from '../server/modules/dish/domain/read/value-objects';
import { DishRecipeSections } from '../server/modules/dish/dish.types';
import { DishIngredient } from '../server/modules/ingredient/ingredient.types';
import { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';

export interface ExternalApiDataAdaptable<ExternalApiDishResult, ExternalApiDishDetails, ExternalApiDishInstruction, ExternalApiDishIngredient> {
    toDishes: (data: ExternalApiDishResult[], providedIngredients?: string[]) => DishResultValueObject[];
    toDishDetails: (data: ExternalApiDishDetails) => DishDetailsValueObject;
    toDishRecipeSections: (instructionData: ExternalApiDishInstruction) => DishRecipeSections;
    toDishIngredients: (ingredients: ExternalApiDishIngredient[]) => DishIngredient[];
}

export const EXTERNAL_API_DATA_ADAPTABLE_TOKEN: InjectionToken = 'EXTERNAL_API_DATA_ADAPTABLE_TOKEN';