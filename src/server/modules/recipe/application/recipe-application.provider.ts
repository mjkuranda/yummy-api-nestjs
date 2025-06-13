import { Provider } from '@nestjs/common';
import { AddRecipeUseCase, GetRecipeUseCase } from './use-cases';

export const recipeApplicationProviders: Provider[] = [
    AddRecipeUseCase,
    GetRecipeUseCase
];