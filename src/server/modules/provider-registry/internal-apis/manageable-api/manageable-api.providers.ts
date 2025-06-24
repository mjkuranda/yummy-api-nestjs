import { Provider } from '@nestjs/common';
import { DishApiService, RecipeApiService, UserApiService } from './services';

export const API_PROVIDERS: Provider[] = [
    DishApiService,
    RecipeApiService,
    UserApiService
];