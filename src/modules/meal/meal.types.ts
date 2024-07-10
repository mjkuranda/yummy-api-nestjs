import { IngredientType, MealIngredient } from '../ingredient/ingredient.types';

export type RatedMeal = {
    id: string,
    imgUrl?: string,
    ingredients: IngredientType[],
    title: string,
    relevance: number
};

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
    }
};

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