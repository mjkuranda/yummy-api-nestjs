import { SpoonacularIngredient, SpoonacularRecipe } from './spoonacular.api.types';
import { RatedMeal } from '../../meal/meal.types';
import { IngredientType } from '../../ingredient/ingredient.types';
import { inferMealType } from '../../../common/helpers';

export function proceedRecipesToMeals(recipes: SpoonacularRecipe[]): RatedMeal[] {
    return recipes.map(recipe => {
        return {
            id: recipe.id.toString(),
            imgUrl: recipe.image,
            ingredients: [...proceedIngredients(recipe.usedIngredients), ...proceedIngredients(recipe.missedIngredients)],
            missingCount: recipe.missedIngredients.length,
            relevance: recipe.usedIngredients.length / (recipe.usedIngredients.length + recipe.missedIngredients.length),
            title: recipe.title,
            provider: 'spoonacular',
            type: inferMealType(recipe.title)
        };
    });
}

function proceedIngredients(ingredients: SpoonacularIngredient[]): IngredientType[] {
    return ingredients.map(ingredient => ingredient.name);
}