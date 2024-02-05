import { UserSchema } from '../mongodb/schemas/user.schema';
import { UserActionSchema } from '../mongodb/schemas/user-action.schema';
import { MealSchema } from '../mongodb/schemas/meal.schema';
import { IngredientSchema } from '../mongodb/schemas/ingredient.schema';

export const models = {
    MEAL_MODEL: 'MEAL_MODEL',
    INGREDIENT_MODEL: 'INGREDIENT_MODEL',
    USER_MODEL: 'USER_MODEL',
    USER_ACTION_MODEL: 'USER_ACTION_MODEL'
};

export const USER_MODEL = { name: models.USER_MODEL, schema: UserSchema };
export const USER_ACTION_MODEL = { name: models.USER_ACTION_MODEL, schema: UserActionSchema };
export const MEAL_MODEL = { name: models.MEAL_MODEL, schema: MealSchema };
export const INGREDIENT_MODEL = { name: models.INGREDIENT_MODEL, schema: IngredientSchema };
