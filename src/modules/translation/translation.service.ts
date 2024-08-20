import { Injectable } from '@nestjs/common';
import { translate } from 'google-translate-api-x';
import { MealIngredient } from '../ingredient/ingredient.types';
import { Language } from '../../common/types';
import { TranslatedIngredient } from './translation.types';
import { MealRecipeSection, MealRecipeSections, MealRecipeStep } from '../meal/meal.types';

@Injectable()
export class TranslationService {

    async translateRecipe(recipeSections: MealRecipeSections, targetLanguage?: Language): Promise<MealRecipeSections> {
        const language = targetLanguage ?? 'en';

        return await Promise.all(
            recipeSections.map(
                section => this._translateRecipeSection(section, language)
            )
        );
    }

    async _translateRecipeSection(recipeSection: MealRecipeSection, targetLanguage: Language): Promise<MealRecipeSection> {
        const { name, steps } = recipeSection;

        const translatedSteps: string[] = await Promise.all(steps.map(step => this.translate(step.step, targetLanguage)));
        const completedSteps: MealRecipeStep[] = translatedSteps.map((step, idx) => ({
            number: idx + 1,
            step: step
        }));

        return {
            name,
            steps: completedSteps
        };
    }

    async translateIngredients(ingredients: MealIngredient[], targetLanguage?: Language): Promise<TranslatedIngredient[]> {
        const translatedIngredients = ingredients.map(async (ingredient) => {
            const { amount, unit, name, imageUrl } = ingredient;
            const text = await this.translate(`${amount} ${unit} ${name}`, targetLanguage ?? 'en');

            return { text, imageUrl } as TranslatedIngredient;
        });

        return await Promise.all(translatedIngredients);
    }

    async translate(text: string, targetLanguage: string): Promise<string> {
        const result = await translate(text, { to: targetLanguage });

        return result.text;
    }
}