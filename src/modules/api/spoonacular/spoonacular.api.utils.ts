import { SpoonacularIngredient, SpoonacularRecipe } from './spoonacular.api.types';
import { RatedDish } from '../../dish/dish.types';
import { IngredientType } from '../../ingredient/ingredient.types';
import { discardDecimalPoint, inferDishType, inferMealType, toFixNumber } from '../../../common/helpers';
import { IngredientUnitConverters } from '../../../common/enums';

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

export function proceedIngredientUnit(ingredient: SpoonacularIngredient): SpoonacularIngredient {
    const converter = IngredientUnitConverters[ingredient.unit];

    if (!converter) {
        return ingredient;
    }

    const { multiplier, targetUnit, targetUnitBorder, superiorUnit } = converter;

    const convertedAmount = ingredient.amount * multiplier;
    const unit = convertedAmount > targetUnitBorder ? superiorUnit : targetUnit;
    const amount = convertedAmount > targetUnitBorder ? convertedAmount / targetUnitBorder : convertedAmount;

    return {
        ...ingredient,
        name: ingredient.name,
        image: ingredient.image,
        amount: ['g', 'ml'].includes(unit) ? discardDecimalPoint(amount) : toFixNumber(amount, 1),
        unit
    };
}

export function proceedTagsSpaces(dishDescription: string): string {
    return dishDescription.replaceAll(/<\s*\/\s*([abi])\s*>/g, '</$1>');
}