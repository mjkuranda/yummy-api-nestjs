import { Injectable } from '@nestjs/common';
import { MealIngredient } from '../ingredient/ingredient.types';
import { Language } from '../../common/types';
import { TranslatedIngredient } from './translation.types';
import { MealRecipeSection, MealRecipeSections } from '../meal/meal.types';
import { compoundTextToTranslate, convertAmountToText, normalizeName, normalizeUnit } from '../../common/helpers';
import translate from '@iamtraction/google-translate';

@Injectable()
export class TranslationService {

    async translateDescription(description: string, targetLanguage?: Language): Promise<string> {
        // NOTE: Do not translate when your language is English
        if (['en', 'en-US'].includes(targetLanguage)) {
            return '';
        }

        return await this.translate(description, targetLanguage);
    }

    async translateRecipe(recipeSections: MealRecipeSections, targetLanguage?: Language): Promise<MealRecipeSections> {
        // NOTE: Do not translate when your language is English
        if (['en', 'en-US'].includes(targetLanguage)) {
            return [];
        }

        return await Promise.all(
            recipeSections.map(
                section => this._translateRecipeSection(section, targetLanguage)
            )
        );
    }

    async _translateRecipeSection(recipeSection: MealRecipeSection, targetLanguage?: Language): Promise<MealRecipeSection> {
        const { name, steps } = recipeSection;

        const translatedSteps: string[] = await Promise.all(steps.map(step => this.translate(step, targetLanguage)));

        return {
            name,
            steps: translatedSteps
        };
    }

    async translateIngredients(ingredients: MealIngredient[], targetLanguage?: Language): Promise<TranslatedIngredient[]> {
        // NOTE: Do not translate when your language is English
        if (['en', 'en-US'].includes(targetLanguage)) {
            return [];
        }

        const translatedIngredients = ingredients.map(async (ingredient) => {
            const { amount, unit, name, imageUrl } = ingredient;
            const normalizedName = normalizeName(name);
            const normalizedUnit = normalizeUnit(amount, unit);
            const textAmount = convertAmountToText(amount);
            const compoundedText = compoundTextToTranslate(textAmount, normalizedUnit, normalizedName);
            const text = await this.translate(compoundedText, targetLanguage);

            return { text, imageUrl } as TranslatedIngredient;
        });

        return await Promise.all(translatedIngredients);
    }

    async translate(text: string, targetLanguage: Language): Promise<string> {
        const language = this._getTargetLanguage(targetLanguage);
        const result = await translate(text, { from: 'en', to: language });

        return result.text;
    }

    private _getTargetLanguage(targetLanguage?: Language): Language {
        if (!targetLanguage) {
            return 'en';
        }

        const languages: Language[] = ['en', 'en-US', 'pl'];

        if (!languages.includes(targetLanguage)) {
            return 'en';
        }

        return targetLanguage;
    }
}