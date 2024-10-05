import { SpoonacularIngredient, SpoonacularRecipe } from './spoonacular.api.types';
import { RatedDish } from '../../dish/dish.types';
import { IngredientType } from '../../ingredient/ingredient.types';
import { inferDishType } from '../../../common/helpers';
import { MealType } from '../../../common/enums';

export function proceedRecipesToDishes(recipes: SpoonacularRecipe[]): RatedDish[] {
    return recipes.map(recipe => {
        return {
            id: recipe.id.toString(),
            imgUrl: recipe.image,
            ingredients: [...proceedIngredients(recipe.usedIngredients), ...proceedIngredients(recipe.missedIngredients)],
            missingCount: recipe.missedIngredients.length,
            relevance: recipe.usedIngredients.length / (recipe.usedIngredients.length + recipe.missedIngredients.length),
            title: recipe.title,
            provider: 'spoonacular',
            type: inferDishType(recipe.title),
            mealType: MealType.ANY
        };
    });
}

function proceedIngredients(ingredients: SpoonacularIngredient[]): IngredientType[] {
    return ingredients.map(ingredient => ingredient.name);
}