import { DishType, MealType } from '../../../../common/enums';
import { DishRecipeSection } from '../../../../common/types';

export class EditDishDto<Ingredient> {
    readonly title?: string;
    readonly description?: string;
    readonly mealType?: MealType;
    readonly dishType?: DishType;
    readonly ingredients?: Ingredient[];
    readonly readyInMinutes?: number;
    readonly recipeSections?: DishRecipeSection[];
    readonly imageUrl?: string;
}