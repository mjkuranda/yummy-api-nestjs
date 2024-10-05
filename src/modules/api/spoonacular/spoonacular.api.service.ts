import { Injectable } from '@nestjs/common';
import { DetailedDish, RatedDish } from '../../dish/dish.types';
import { AbstractApiService } from '../../../services/abstract.api.service';
import { ApiName } from '../../redis/redis.types';
import {
    SpoonacularIngredient,
    SpoonacularRecipe,
    SpoonacularRecipeDetails,
    SpoonacularRecipeSections
} from './spoonacular.api.types';
import { IngredientType, DishIngredient } from '../../ingredient/ingredient.types';
import { calculateCheckingAgain, inferDishType } from '../../../common/helpers';
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

    proceedDataToDishIngredients(ingredients: SpoonacularIngredient[]): DishIngredient[] {
        const ingredientSet = new Set<`${string}-${number}`>([]); // name and amount

        const removeDuplicates = (ingredient: SpoonacularIngredient): boolean => {
            const { name, amount } = ingredient;
            const ingredientKey: `${string}-${number}` = `${name}-${amount}`;

            if (ingredientSet.has(ingredientKey)) {
                return false;
            }

            ingredientSet.add(ingredientKey);

            return true;
        };

        return ingredients.filter(removeDuplicates).map(ingredient => ({
            amount: ingredient.amount,
            imageUrl: `https://img.spoonacular.com/ingredients_250x250/${ingredient.image}`,
            name: ingredient.name,
            unit: ingredient.unit
        }));
    }

    proceedDataToDishes(data: SpoonacularRecipe[], providedIngredients?: IngredientType[]): RatedDish[] {
        return data.map(recipe => {
            const { relevance, missingCount } = calculateCheckingAgain(providedIngredients, recipe.usedIngredients, recipe.missedIngredients);

            return {
                id: recipe.id.toString(),
                imgUrl: recipe.image,
                ingredients: [...this.proceedDataToIngredientList(recipe.usedIngredients), ...this.proceedDataToIngredientList(recipe.missedIngredients)],
                missingCount,
                relevance,
                title: recipe.title,
                provider: 'spoonacular',
                type: inferDishType(recipe.title),
                mealType: MealType.ANY
            };
        });
    }

    proceedDataToDishDetails(data: SpoonacularRecipeDetails, recipeSections: SpoonacularRecipeSections): DetailedDish {
        const {
            id, image, title, extendedIngredients, summary,
            vegetarian, vegan, glutenFree, dairyFree, veryHealthy,
            readyInMinutes, sourceName
        } = data;

        return {
            id: id.toString(),
            imgUrl: image,
            ingredients: this.proceedDataToDishIngredients(extendedIngredients),
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
            type: inferDishType(title),
            mealType: MealType.ANY
        };
    }
}