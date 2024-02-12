import { Injectable } from '@nestjs/common';
import { RatedMeal } from '../../meal/meal.types';
import { AbstractApiService } from '../abstract.api.service';
import { ApiName } from '../../redis/redis.types';
import { SpoonacularIngredient, SpoonacularRecipe } from './spoonacular.api.types';
import { IngredientType } from '../../../common/types';

@Injectable()
export class SpoonacularApiService extends AbstractApiService<SpoonacularRecipe, SpoonacularIngredient> {

    getApiUrl(): string {
        return 'https://api.spoonacular.com';
    }

    getName(): ApiName {
        return 'spoonacular';
    }

    proceedDataToMeals(data: SpoonacularRecipe[]): RatedMeal[] {
        return data.map(recipe => {
            return {
                id: recipe.id.toString(),
                imgUrl: recipe.image,
                ingredients: [...this.proceedDataMealIngredients(recipe.usedIngredients), ...this.proceedDataMealIngredients(recipe.missedIngredients)],
                relevance: Number((recipe.usedIngredients.length / (recipe.usedIngredients.length + recipe.missedIngredients.length)).toFixed(2)),
                title: recipe.title
            };
        });
    }

    proceedDataMealIngredients(ingredients: SpoonacularIngredient[]): IngredientType[] {
        return ingredients.map(ingredient => {
            return {
                name: ingredient.name,
                unit: ingredient.unit,
                amount: ingredient.amount
            };
        });
    }
}