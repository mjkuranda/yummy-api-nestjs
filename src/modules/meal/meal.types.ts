import { IngredientType } from '../../common/types';

export type RatedMeal = {
    id: string,
    imgUrl?: string,
    ingredients: IngredientType[],
    title: string,
    relevance: number
};