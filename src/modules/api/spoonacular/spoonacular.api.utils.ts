import { SpoonacularIngredient, SpoonacularRecipe } from './spoonacular.api.types';
import { RatedDish } from '../../dish/dish.types';
import { IngredientType } from '../../ingredient/ingredient.types';
import { inferDishType, inferMealType } from '../../../common/helpers';

export function proceedRecipesToDishes(recipes: SpoonacularRecipe[]): RatedDish[] {
    return recipes.map(recipe => {
        const type = inferDishType(recipe.title);
        const mealType = inferMealType(type);

        return {
            id: recipe.id.toString(),
            imgUrl: recipe.image,
            ingredients: [...proceedIngredients(recipe.usedIngredients), ...proceedIngredients(recipe.missedIngredients)],
            missingCount: recipe.missedIngredients.length,
            relevance: recipe.usedIngredients.length / (recipe.usedIngredients.length + recipe.missedIngredients.length),
            title: recipe.title,
            provider: 'spoonacular',
            type,
            mealType
        };
    });
}

function proceedIngredients(ingredients: SpoonacularIngredient[]): IngredientType[] {
    return ingredients.map(ingredient => ingredient.name);
}