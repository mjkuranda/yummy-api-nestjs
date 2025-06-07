import { Provider } from '@nestjs/common';
import { GetRecipeUseCase } from './use-cases';

export const recipeApplicationProviders: Provider[] = [
    GetRecipeUseCase
];