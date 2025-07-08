import { DishIngredient } from '../../../ingredient/ingredient.types';
import { Language } from '../../../../common/types';
import { DishType, MealType, Provider } from '../../../../common/enums';
import { DishEntity } from './entities';
import { DishId } from '../../../../common/types';

export interface DishEntityProps {
    id: DishId;
    author: string;
    description: string;
    imageUrl: string;
    ingredients: DishIngredient[];
    language: Language;
    posted: number;
    title: string;
    provider: Provider;
    dishType: DishType;
    mealType: MealType;
    readyInMinutes: number;
    softAdded?: boolean;
    softEdited?: DishEntity;
    softDeleted?: boolean;
}