import { DishId } from '../../../common/types';
import { DishType, MealType } from '../../../common/enums';

export interface ExternalApiConstantProvidable {
    getApiKey: () => string;
    getApiUrl: () => string;
    getExternalApiName: () => string;
    getDishesEndpointUrl: (ingredients: string[], mealType?: MealType, dishType?: DishType) => string;
    getDishDetailsEndpointUrl: (dishId: DishId) => string;
    getDishInstructionEndpointUrl: (dishId: DishId) => string;
}