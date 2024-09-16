import { IngredientType, MealIngredient } from '../ingredient/ingredient.types';
import { TranslatedIngredient } from '../translation/translation.types';
import { Language } from '../../common/types';
import { MealType } from '../../common/enums';

export type RatedMeal = {
    id: string,
    imgUrl?: string,
    ingredients: IngredientType[],
    missingCount: number,
    provider: MealProvider,
    title: string,
    relevance: number,
    type: MealType
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
    type: MealType
};

export interface DetailedMealWithTranslations {
    meal: DetailedMeal;
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
    type: MealType
};

export type MealProvider = 'yummy' | 'spoonacular';

export type GetMealsQueryType = Record<GetMealsQueryKeyTypes, string>;

type GetMealsQueryKeyTypes = 'ings' | 'type';

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