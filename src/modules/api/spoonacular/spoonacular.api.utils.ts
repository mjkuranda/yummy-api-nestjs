import { SpoonacularRecipe, SpoonacularIngredient } from './spoonacular.api.types';
import { RatedMeal } from '../../meal/meal.types';
import { IngredientType } from '../../../common/types';

export function proceedRecipesToMeals(recipes: SpoonacularRecipe[]): RatedMeal[] {
    return recipes.map(recipe => {
        return {
            id: recipe.id.toString(),
            imgUrl: recipe.image,
            ingredients: [...proceedIngredients(recipe.usedIngredients), ...proceedIngredients(recipe.missedIngredients)],
            relevance: recipe.usedIngredients.length / (recipe.usedIngredients.length + recipe.missedIngredients.length),
            title: recipe.title
        };
    });
}

function proceedIngredients(ingredients: SpoonacularIngredient[]): IngredientType[] {
    return ingredients.map(ingredient => {
        return {
            name: ingredient.name,
            unit: ingredient.unit,
            amount: ingredient.amount
        };
    });
}