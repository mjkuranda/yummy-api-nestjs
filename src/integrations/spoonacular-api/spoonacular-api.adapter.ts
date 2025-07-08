import { Injectable } from '@nestjs/common';
import { ExternalApiDataAdaptable } from '../interfaces';
import {
    SpoonacularIngredient,
    SpoonacularRecipe,
    SpoonacularRecipeDetails,
    SpoonacularRecipeSections
} from './spoonacular-api.types';
import { DishDetailsVo, DishResultVo } from '../../server/modules/dish/domain/read/vos';
import { DishRecipeSection } from '../../server/modules/dish/dish.types';
import {
    calculateCheckingAgain,
    discardDecimalPoint,
    inferDishType,
    inferMealType,
    toFixNumber
} from '../../server/common/helpers';
import { IngredientUnitConverters, Provider } from '../../server/common/enums';
import { DishIngredient } from '../../server/modules/ingredient/ingredient.types';
import { EncodedDishIdVo } from '../../server/modules/dish/domain/common/vos';
import { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';

export const SPOONACULAR_API_ADAPTER_TOKEN: InjectionToken = 'SPOONACULAR_API_ADAPTER_TOKEN';

@Injectable()
export class SpoonacularApiAdapter implements ExternalApiDataAdaptable<SpoonacularRecipe, SpoonacularRecipeDetails, SpoonacularRecipeSections, SpoonacularIngredient> {

    toDishes(data: SpoonacularRecipe[], providedIngredients: string[]): DishResultVo[] {
        return data.map(recipe => {
            const { relevance, missingCount } = calculateCheckingAgain(providedIngredients, recipe.usedIngredients, recipe.missedIngredients);
            const provider = Provider.EXT_API_SPOONACULAR;
            const encodedDishId = EncodedDishIdVo.fromParts(provider, recipe.id);
            const ingredients = [
                ...recipe.usedIngredients.map(ingredient => ingredient.name),
                ...recipe.missedIngredients.map(ingredient => ingredient.name)
            ];
            const dishType = inferDishType(recipe.title);
            const mealType = inferMealType(dishType);

            return new DishResultVo(
                encodedDishId,
                recipe.title,
                ingredients,
                'en',
                provider,
                dishType,
                mealType,
                relevance,
                missingCount,
                recipe.image
            );
        });
    }

    toDishDetails(data: SpoonacularRecipeDetails): DishDetailsVo {
        const {
            image, title, extendedIngredients, summary,
            vegetarian, vegan, glutenFree, dairyFree, veryHealthy,
            readyInMinutes, sourceName
        } = data;
        const ingredients = this.toDishIngredients(extendedIngredients);
        const dishType = inferDishType(title);
        const mealType = inferMealType(dishType);

        return new DishDetailsVo(
            title,
            summary,
            ingredients,
            readyInMinutes,
            sourceName,
            'en',
            Provider.EXT_API_SPOONACULAR,
            dishType,
            mealType,
            false,
            false,
            image,
            {
                vegetarian,
                vegan,
                glutenFree,
                dairyFree,
                veryHealthy
            }
        );
    }

    toDishRecipeSections(instructionData: SpoonacularRecipeSections): DishRecipeSection[] {
        return instructionData.map(section => ({
            name: section.name,
            steps: section.steps.map(step => step.step)
        }));
    }

    toDishIngredients(ingredients: SpoonacularIngredient[]): DishIngredient[] {
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

        const proceedIngredientUnit = (ingredient: SpoonacularIngredient): SpoonacularIngredient => {
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
        };

        return ingredients
            .filter(removeDuplicates)
            .map(proceedIngredientUnit)
            .map(ingredient => ({
                amount: ingredient.amount,
                imageUrl: `https://img.spoonacular.com/ingredients_250x250/${ingredient.image}`,
                name: ingredient.name,
                unit: ingredient.unit
            }));
    }
}