import { IngredientName, IngredientUnit } from '../../../common/enums';

export type SpoonacularIngredient = {
    amount: number,
    id: number,
    imageUrl: string,
    meta: [],
    name: IngredientName,
    unit: IngredientUnit
};

export type SpoonacularRecipe = {
    id: number,
    image: string,
    imageType: string,
    likes: number,
    missedIngredients: SpoonacularIngredient[],
    title: string,
    unusedIngredients: SpoonacularIngredient[],
    usedIngredients: SpoonacularIngredient[]
};

export type SpoonacularRecipeDetails = {
    id: number,
    image: string,
    title: string,
    extendedIngredients: SpoonacularIngredient[]
};