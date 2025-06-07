import { IngredientType, DishIngredient, DishIngredientWithoutImage } from '../ingredient/ingredient.types';
import { TranslatedIngredient } from '../translation/translation.types';
import { Language } from '../../common/types';
import { MealType, DishType, Provider } from '../../common/enums';
import { CreateDishWithAuthorDto } from './dish.dto';
import { EncodedDishId } from './encoded-dish-id.value-object';

export type DishId = string | number;

export interface RatedDish {
    encodedDishId: EncodedDishId; // TODO: fix this
    imgUrl?: string;
    ingredients: IngredientType[];
    missingCount: number;
    language: Language;
    provider: Provider;
    title: string;
    relevance: number;
    type: DishType;
    mealType: MealType;
}

export type DishRecipeSection = {
    name?: string,
    steps: string[]
};

export type DishRecipeSections = DishRecipeSection[];

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

export type DetailedDishWithTranslations = Omit<DetailedDish, 'ingredients' | 'language'> & {
    ingredients: {
        original: DishIngredient[];
        translated: TranslatedIngredient[]
    };
    language: {
        original: Language;
        translated: Language;
    };
};

export interface ProposedDish {
    encodedDishId: string;
    imgUrl?: string;
    ingredients: IngredientType[];
    recommendationPoints: number;
    title: string;
    provider: Provider;
    type: DishType;
    mealType: MealType;
}

export type CreateDishDataType = Omit<CreateDishWithAuthorDto<DishIngredientWithoutImage>, 'author'>;

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