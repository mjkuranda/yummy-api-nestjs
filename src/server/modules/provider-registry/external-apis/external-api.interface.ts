import { DishId } from '../../dish/dish.types';
import { DishType, MealType } from '../../../common/enums';

export interface ExternalApiConstantProvidable {
    getApiKey: () => string;
    getApiUrl: () => string;
    getExternalApiName: () => string;
    getDishesEndpointUrl: (ingredients: string[], mealType?: MealType, dishType?: DishType) => string;
    getDishDetailsEndpointUrl: (dishId: DishId) => string;
    getDishInstructionEndpointUrl: (dishId: DishId) => string;
}