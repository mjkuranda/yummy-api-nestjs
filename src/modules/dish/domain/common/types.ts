import { DishIngredient } from '../../../ingredient/ingredient.types';
import { Language } from '../../../../common/types';
import { DishType, MealType } from '../../../../common/enums';
import { DishEntity } from './entities';

export interface DishEntityProps {
    author: string;
    description: string;
    imageUrl: string;
    ingredients: DishIngredient[];
    language: Language;
    posted: number;
    title: string;
    dishType: DishType;
    mealType: MealType;
    readyInMinutes: number;
    softAdded?: boolean;
    softEdited?: DishEntity;
    softDeleted?: boolean;
}