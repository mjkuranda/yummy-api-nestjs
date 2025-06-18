export interface ExternalApiDataAdaptable<ExternalApiDishResult, ExternalApiDishDetails, ExternalApiDishInstruction, ExternalApiDishIngredient> {
    toDishes(data: ExternalApiDishResult[], providedIngredients: string[]): any[];
    toDishDetails(data: ExternalApiDishDetails): any;
    toDishRecipeSections(instructionData: ExternalApiDishInstruction): any;
    toDishIngredients(ingredients: ExternalApiDishIngredient[]): any[];
}

export const EXTERNAL_API_DATA_ADAPTABLE_TOKEN = 'EXTERNAL_API_DATA_ADAPTABLE_TOKEN';