import { IngredientName } from '../../../common/enums';

export type SpoonacularIngredient = {
    amount: number,
    id: number,
    image: string,
    meta: [],
    name: IngredientName,
    unit: string
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
    extendedIngredients: SpoonacularIngredient[],
    summary: string,
    readyInMinutes: number;
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    veryHealthy: boolean;
    creditsText: string;
    sourceName: string;
};

type SpoonacularRecipeStep = {
    number: number,
    step: string
};

export type SpoonacularRecipeSection = {
    name: string,
    steps: SpoonacularRecipeStep[]
};

export type SpoonacularRecipeSections = SpoonacularRecipeSection[];