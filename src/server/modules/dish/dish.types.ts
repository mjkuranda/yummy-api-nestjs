import { DishIngredientWithoutImage } from '../ingredient/ingredient.types';
import { CreateDishWithAuthorDto } from './application/dtos';

export type DishId = string | number;

export type DishRecipeSection = {
    name?: string,
    steps: string[]
};

export type DishRecipeSections = DishRecipeSection[];

export type CreateDishDataType = Omit<CreateDishWithAuthorDto<DishIngredientWithoutImage>, 'author'>;

export type GetDishesQueryType = Record<GetDishesQueryKeyTypes, string>;

type GetDishesQueryKeyTypes = 'ings' | 'type' | 'dish';

export type MergedSearchQueries = Record<string, number>;