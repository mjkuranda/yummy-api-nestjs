import { IngredientType } from '../ingredient/ingredient.types';

export type RatedMeal = {
    id: string,
    imgUrl?: string,
    ingredients: IngredientType[],
    title: string,
    relevance: number
};

export type GetMealsQueryType = Record<GetMealsQueryKeyTypes, string>;

type GetMealsQueryKeyTypes = 'ings' | 'type';