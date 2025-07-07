import { DishIngredient, DishIngredientWithoutImage } from '../ingredient/ingredient.types';
import { Language } from '../../common/types';
import { MealType, DishType, Provider } from '../../common/enums';
import { CreateDishWithAuthorDto } from './dish.dto';

export type DishId = string | number;

export type DishRecipeSection = {
    name?: string,
    steps: string[]
};

export type DishRecipeSections = DishRecipeSection[];

// FIXME: Deprecated
export interface DetailedDish {
    imgUrl?: string;
    ingredients: DishIngredient[];
    language: Language;
    title: string;
    description: string;
    readyInMinutes: number;
    sourceOrAuthor: string;
    properties?: {
        vegetarian?: boolean;
        vegan?: boolean;
        glutenFree?: boolean;
        dairyFree?: boolean;
        veryHealthy?: boolean;
    };
    provider: Provider;
    type: DishType;
    mealType: MealType;
}

export type CreateDishDataType = Omit<CreateDishWithAuthorDto<DishIngredientWithoutImage>, 'author'>;

export type GetDishesQueryType = Record<GetDishesQueryKeyTypes, string>;

type GetDishesQueryKeyTypes = 'ings' | 'type' | 'dish';

export type MergedSearchQueries = Record<string, number>;