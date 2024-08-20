import { IngredientType, MealIngredient } from '../ingredient/ingredient.types';
import { TranslatedIngredient } from '../translation/translation.types';

export type RatedMeal = {
    id: string,
    imgUrl?: string,
    ingredients: IngredientType[],
    title: string,
    relevance: number
};

type MealRecipeSection = {
    name?: string,
    steps: {
        number: number,
        step: string
    }[]
};

export type MealRecipeSections = MealRecipeSection[];

export type DetailedMeal = {
    id: string,
    imgUrl?: string,
    ingredients: MealIngredient[],
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
    recipeSections: MealRecipeSections
};

export interface DetailedMealWithTranslatedIngredients {
    meal: DetailedMeal;
    ingredients: TranslatedIngredient[];
}

export type ProposedMeal = {
    id: string,
    imgUrl?: string,
    ingredients: IngredientType[],
    recommendationPoints: number,
    title: string
};

export type GetMealsQueryType = Record<GetMealsQueryKeyTypes, string>;

type GetMealsQueryKeyTypes = 'ings' | 'type';

export type MergedSearchQueries = Record<string, number>;

export interface MealProposalDto {
    ingredients: string[];
    date: Date;
    login: string;
}