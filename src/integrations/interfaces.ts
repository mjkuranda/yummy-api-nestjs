import { DishDetailsValueObject, DishResultValueObject } from '../server/modules/dish/domain/read/value-objects';
import { DishRecipeSections } from '../server/modules/dish/dish.types';
import { DishIngredient } from '../server/modules/ingredient/ingredient.types';

export interface ExternalApiDataAdaptable<ExternalApiDishResult, ExternalApiDishDetails, ExternalApiDishInstruction, ExternalApiDishIngredient> {
    toDishes: (data: ExternalApiDishResult[], providedIngredients?: string[]) => DishResultValueObject[];
    toDishDetails: (data: ExternalApiDishDetails) => DishDetailsValueObject;
    toDishRecipeSections: (instructionData: ExternalApiDishInstruction) => DishRecipeSections;
    toDishIngredients: (ingredients: ExternalApiDishIngredient[]) => DishIngredient[];
}