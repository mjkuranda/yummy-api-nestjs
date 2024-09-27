import { Injectable } from '@nestjs/common';
import { MealIngredient } from '../ingredient/ingredient.types';
import { Language } from '../../common/types';
import { TranslatedDetailedMeal, TranslatedIngredient } from './translation.types';
import { DetailedMeal, MealRecipeSection, MealRecipeSections } from '../meal/meal.types';
import { compoundTextToTranslate, convertAmountToText, normalizeName, normalizeUnit } from '../../common/helpers';
import translate from '@iamtraction/google-translate';

@Injectable()
export class TranslationService {

    async translateMeal(meal: DetailedMeal, targetLanguage?: Language): Promise<TranslatedDetailedMeal> {
        // NOTE: Do not translate when your language is English
        if (['en', 'en-US'].includes(targetLanguage)) {
            return {
                description: '',
                ingredients: [],
                recipe: []
            };
        }

        const { description, ingredients, recipeSections } = meal;
        const recipeNewSectionIndexes: number[] = recipeSections.reduce((acc, curr) => {
            if (acc.length === 0) {
                return [0];
            }

            return [...acc, acc.reduce((els, el) => els + el, 0) + curr.steps.length + 1];
        }, []);
        const ingredientImages: string[] = [];
        const startRecipeIdx: number = ingredients.length;

        const stringToTranslate: string = [
            description,
            ...ingredients.map(ingredient => {
                const { amount, unit, name, imageUrl } = ingredient;
                const normalizedName = normalizeName(name);
                const normalizedUnit = normalizeUnit(amount, unit);
                const textAmount = convertAmountToText(amount);
                const compoundedText = compoundTextToTranslate(textAmount, normalizedUnit, normalizedName);

                ingredientImages.push(imageUrl);

                return compoundedText;
            }),
            ...recipeSections.map(section => {
                return [
                    section.name,
                    ...section.steps
                ];
            }).flat()
        ].join('\n');

        const translatedResult = await this.translate(stringToTranslate, targetLanguage);
        const [ translatedDescription, ...translatedIngredientsAndRecipes] = translatedResult.split('\n');
        const translatedIngredients = translatedIngredientsAndRecipes.slice(0, startRecipeIdx);
        const translatedRecipes = translatedIngredientsAndRecipes.slice(startRecipeIdx);

        const ingredientList: TranslatedIngredient[] = translatedIngredients.map((ingredient, idx) => ({ text: ingredient, imageUrl: ingredientImages[idx] }));
        const translatedRecipeSections: MealRecipeSections = recipeNewSectionIndexes.map((index, idx, sections) => {
            const nextSection = sections[idx + 1];

            if (!nextSection) {
                return {
                    name: translatedRecipes[index],
                    steps: translatedRecipes.slice(index + 1)
                };
            }

            return {
                name: translatedRecipes[index],
                steps: translatedRecipes.slice(index + 1, nextSection)
            };
        });

        return {
            description: translatedDescription,
            ingredients: ingredientList,
            recipe: translatedRecipeSections
        };
    }

    // FIXME: Deprecated
    async translateDescription(description: string, targetLanguage?: Language): Promise<string> {
        // NOTE: Do not translate when your language is English
        if (['en', 'en-US'].includes(targetLanguage)) {
            return '';
        }

        return await this.translate(description, targetLanguage);
    }

    // FIXME: Deprecated
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

    // FIXME: Deprecated
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
        if (text === '') {
            return '';
        }

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