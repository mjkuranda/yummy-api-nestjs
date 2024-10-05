import { Injectable } from '@nestjs/common';
import { Language } from '../../common/types';
import { TranslatedDetailedMeal, TranslatedIngredient } from './translation.types';
import { DetailedDish, DishRecipeSections } from '../dish/dish.types';
import { compoundTextToTranslate, convertAmountToText, normalizeName, normalizeUnit } from '../../common/helpers';
import translate from '@iamtraction/google-translate';

@Injectable()
export class TranslationService {

    async translateDish(meal: DetailedDish, targetLanguage?: Language): Promise<TranslatedDetailedMeal> {
        // NOTE: Do not translate when your language is English
        if (['en', 'en-US'].includes(targetLanguage)) {
            return {
                description: '',
                ingredients: [],
                recipe: []
            };
        }

        const { description, ingredients, recipeSections } = meal;
        const recipeNewSectionIndexes: number[] = recipeSections.reduce((acc, curr, idx) => {
            if (acc.length === 0) {
                return [0];
            }

            return [...acc, acc.at(-1) + recipeSections[idx - 1].steps.length + 1];
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
        const translatedRecipeSections: DishRecipeSections = recipeNewSectionIndexes.map((index, idx, sections) => {
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