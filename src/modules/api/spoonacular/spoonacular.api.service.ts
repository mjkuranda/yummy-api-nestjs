import { Injectable } from '@nestjs/common';
import { DetailedMeal, RatedMeal } from '../../meal/meal.types';
import { AbstractApiService } from '../../../services/abstract.api.service';
import { ApiName } from '../../redis/redis.types';
import {
    SpoonacularIngredient,
    SpoonacularRecipe,
    SpoonacularRecipeDetails,
    SpoonacularRecipeSections
} from './spoonacular.api.types';
import { IngredientType, MealIngredient } from '../../ingredient/ingredient.types';
import { MealType } from '../../../common/enums';

@Injectable()
export class SpoonacularApiService extends AbstractApiService<SpoonacularRecipe, SpoonacularIngredient, SpoonacularRecipeDetails, SpoonacularRecipeSections> {

    getApiUrl(): string {
        return 'https://api.spoonacular.com';
    }

    getName(): ApiName {
        return 'spoonacular';
    }

    proceedDataToIngredientList(ingredients: SpoonacularIngredient[]): IngredientType[] {
        return ingredients.map(ingredient => ingredient.name);
    }

    proceedDataToMealIngredients(ingredients: SpoonacularIngredient[]): MealIngredient[] {
        return ingredients.map(ingredient => ({
            amount: ingredient.amount,
            imageUrl: `https://img.spoonacular.com/ingredients_250x250/${ingredient.image}`,
            name: ingredient.name,
            unit: ingredient.unit
        }));
    }

    proceedDataToMeals(data: SpoonacularRecipe[]): RatedMeal[] {
        return data.map(recipe => {
            return {
                id: recipe.id.toString(),
                imgUrl: recipe.image,
                ingredients: [...this.proceedDataToIngredientList(recipe.usedIngredients), ...this.proceedDataToIngredientList(recipe.missedIngredients)],
                relevance: Number((recipe.usedIngredients.length / (recipe.usedIngredients.length + recipe.missedIngredients.length)).toFixed(2)),
                title: recipe.title,
                provider: 'spoonacular',
                type: MealType.ANY
            };
        });
    }

    proceedDataToMealDetails(data: SpoonacularRecipeDetails, recipeSections: SpoonacularRecipeSections): DetailedMeal {
        const {
            id, image, title, extendedIngredients, summary,
            vegetarian, vegan, glutenFree, dairyFree, veryHealthy,
            readyInMinutes, sourceName
        } = data;

        return {
            id: id.toString(),
            imgUrl: image,
            ingredients: this.proceedDataToMealIngredients(extendedIngredients),
            language: 'en',
            title,
            description: summary,
            readyInMinutes,
            sourceOrAuthor: sourceName,
            properties: {
                vegetarian,
                vegan,
                glutenFree,
                dairyFree,
                veryHealthy
            },
            provider: 'spoonacular',
            recipeSections: recipeSections.map(section => ({
                name: section.name,
                steps: section.steps.map(step => step.step)
            })),
            type: MealType.ANY
        };
    }
}