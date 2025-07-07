import { DishType, MealType } from '../../../../common/enums';
import { DishRecipeSections } from '../../dish.types';

export class EditDishDto<Ingredient> {
    readonly title?: string;
    readonly description?: string;
    readonly type?: DishType;
    readonly mealType?: MealType;
    readonly ingredients?: Ingredient[];
    readonly readyInMinutes?: number;
    readonly recipeSections?: DishRecipeSections;
    readonly imageUrl?: string;
}