import { DishResultVo } from '../../vos';
import { MealType } from '../../../../../../common/enums';

export const resultDishesListFixture: DishResultVo[] = [
    { relevance: 0.5, mealType: MealType.LAUNCH } as any,
    { relevance: 0.2, mealType: MealType.BREAKFAST } as any,
    { relevance: 0.0, mealType: MealType.LAUNCH } as any
];

export const ingredientsFixture = ['apple', 'carrot'];

export const mealTypeFixture: MealType = MealType.LAUNCH;