import { IngredientType, MealIngredient } from '../ingredient/ingredient.types';
import { TranslatedIngredient } from '../translation/translation.types';
import { Language } from '../../common/types';
import { DishType, MealType } from '../../common/enums';

export type RatedMeal = {
    id: string,
    imgUrl?: string,
    ingredients: IngredientType[],
    missingCount: number,
    provider: MealProvider,
    title: string,
    relevance: number,
    type: MealType,
    dishType: DishType
};

export type MealRecipeSection = {
    name?: string,
    steps: string[]
};

export type MealRecipeSections = MealRecipeSection[];

export type DetailedMeal = {
    id: string,
    imgUrl?: string,
    ingredients: MealIngredient[],
    language: Language,
    title: string,
    description: string,
    readyInMinutes: number,
    sourceOrAuthor: string,
    properties?: {
        vegetarian?: boolean,
        vegan?: boolean,
        glutenFree?: boolean,
        dairyFree?: boolean,
        veryHealthy?: boolean
    },
    provider: MealProvider,
    recipeSections: MealRecipeSections,
    type: MealType,
    dishType: DishType
};

export interface DetailedMealWithTranslations {
    meal: DetailedMeal;
    description: string;
    ingredients: TranslatedIngredient[];
    recipe: MealRecipeSections;
}

export type ProposedMeal = {
    id: string,
    imgUrl?: string,
    ingredients: IngredientType[],
    recommendationPoints: number,
    title: string,
    provider: MealProvider,
    type: MealType,
    dishType: DishType
};

export type MealProvider = 'yummy' | 'spoonacular';

export type GetMealsQueryType = Record<GetMealsQueryKeyTypes, string>;

type GetMealsQueryKeyTypes = 'ings' | 'type' | 'dish';

export type MergedSearchQueries = Record<string, number>;

export interface MealProposalDto {
    ingredients: string[];
    date: Date;
    login: string;
}

export interface MealRating {
    mealId: string;
    rating: number;
    count: number;
}