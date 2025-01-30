import { IngredientType, DishIngredient } from '../ingredient/ingredient.types';
import { TranslatedIngredient } from '../translation/translation.types';
import { Language } from '../../common/types';
import { MealType, DishType } from '../../common/enums';

export type RatedDish = {
    id: string,
    imgUrl?: string,
    ingredients: IngredientType[],
    missingCount: number,
    language: Language,
    provider: DishProvider,
    title: string,
    relevance: number,
    type: DishType
    mealType: MealType,
};

export type DishRecipeSection = {
    name?: string,
    steps: string[]
};

export type DishRecipeSections = DishRecipeSection[];

export type DetailedDish = {
    id: string,
    imgUrl?: string,
    ingredients: DishIngredient[],
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
    provider: DishProvider,
    recipeSections: DishRecipeSections,
    type: DishType,
    mealType: MealType
};

export interface DetailedDishWithTranslations {
    dish: DetailedDish;
    description: string;
    ingredients: TranslatedIngredient[];
    recipe: DishRecipeSections;
}

export type ProposedDish = {
    id: string,
    imgUrl?: string,
    ingredients: IngredientType[],
    recommendationPoints: number,
    title: string,
    provider: DishProvider,
    type: DishType,
    mealType: MealType
};

export type DishProvider = 'yummy' | 'spoonacular';

export type GetDishesQueryType = Record<GetDishesQueryKeyTypes, string>;

type GetDishesQueryKeyTypes = 'ings' | 'type' | 'dish';

export type MergedSearchQueries = Record<string, number>;

export interface DishProposalDto {
    ingredients: string[];
    date: Date;
    login: string;
}

export interface DishRating {
    dishId: string;
    rating: number;
    count: number;
}