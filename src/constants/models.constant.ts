import { UserSchema } from '../mongodb/schemas/user.schema';
import { UserActionSchema } from '../mongodb/schemas/user-action.schema';
import { MealSchema } from '../mongodb/schemas/meal.schema';

export const models = {
    MEAL_MODEL: 'MEAL_MODEL',
    USER_MODEL: 'USER_MODEL',
    USER_ACTION_MODEL: 'USER_ACTION_MODEL'
};

export const USER_MODEL = { name: models.USER_MODEL, schema: UserSchema };
export const USER_ACTION_MODEL = { name: models.USER_ACTION_MODEL, schema: UserActionSchema };
export const MEAL_MODEL = { name: models.MEAL_MODEL, schema: MealSchema };