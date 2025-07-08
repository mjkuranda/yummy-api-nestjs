import { Injectable } from '@nestjs/common';
import { Language } from '../../common/types';
import { TranslatedIngredient, TranslatedRecipe } from './translation.types';
import { compoundTextToTranslate, convertAmountToText, normalizeName, normalizeUnit } from '../../common/helpers';
import translate from '@iamtraction/google-translate';
import { DishIngredient } from '../ingredient/ingredient.types';
import { RecipeEntity } from '../recipe/domain/entities';
import { DishDetailsVo, TranslatedDishVo } from '../dish/domain/read/vos';

@Injectable()
export class TranslationService {

    async translateDish(dish: DishDetailsVo, targetLanguage: Language): Promise<TranslatedDishVo> {
        const { description, ingredients, language } = dish;

        if (language === targetLanguage) {
            const translatedIngredients = await this.translateIngredients(ingredients, { originalLanguage: dish.language, targetLanguage });

            return new TranslatedDishVo(description, translatedIngredients);
        }

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
            })
        ].join('\n');

        const translatedResult = await this.translate(stringToTranslate, targetLanguage);
        const [ translatedDescription, ...translatedIngredientsAndRecipes] = translatedResult.split('\n');
        const translatedIngredients = translatedIngredientsAndRecipes.slice(0, startRecipeIdx);

        const ingredientList: TranslatedIngredient[] = translatedIngredients.map((ingredient, idx) => ({ text: ingredient, imageUrl: ingredientImages[idx] }));

        return new TranslatedDishVo(
            this._proceedTagsSpaces(translatedDescription),
            ingredientList
        );
    }

    async translateIngredients(ingredients: DishIngredient[], options: { originalLanguage: Language, targetLanguage: Language }): Promise<TranslatedIngredient[]> {
        const { originalLanguage, targetLanguage } = options;

        const ingredientImages: string[] = [];
        const ingredientsList = ingredients.map(ingredient => {
            const { amount, unit, name, imageUrl } = ingredient;
            const normalizedName = normalizeName(name);
            const normalizedUnit = normalizeUnit(amount, unit);
            const textAmount = convertAmountToText(amount);
            const compoundedText = compoundTextToTranslate(textAmount, normalizedUnit, normalizedName);

            ingredientImages.push(imageUrl);

            return compoundedText;
        });

        if (originalLanguage === targetLanguage) {
            return ingredientsList.map((ingredientText, idx) => ({
                text: ingredientText,
                imageUrl: ingredientImages[idx]
            }));
        }

        const ingredientsToTranslate = ingredientsList.join('\n');
        const translatedResult = await this.translate(ingredientsToTranslate, targetLanguage);
        const translatedIngredients = translatedResult.split('\n');

        return translatedIngredients.map((ingredientText, idx) => ({
            text: ingredientText,
            imageUrl: ingredientImages[idx]
        }));
    }

    async translateRecipe(recipe: RecipeEntity, targetLanguage: Language): Promise<TranslatedRecipe> {
        if (recipe.language === targetLanguage) {
            return {
                original: recipe,
                translated: recipe
            };
        }

        const sectionSeparator = '\t\t\t';
        const innerSectionSeparator = '\n\n';
        const stepSeparator = '\\';

        const stringToTranslate = recipe.sections
            .map(s => (s.steps.join(stepSeparator) + innerSectionSeparator + s.name))
            .join(sectionSeparator);
        const translatedResult = await this.translate(stringToTranslate, targetLanguage);
        const sections = translatedResult.split(sectionSeparator);
        const translatedRecipe = sections.map(s => {
            const [stepString, name] = s.split(innerSectionSeparator);
            const steps = stepString.split(stepSeparator);

            return {
                name: name ?? '',
                steps
            };
        });

        return {
            original: recipe,
            translated: new RecipeEntity(
                targetLanguage,
                recipe.dishId,
                translatedRecipe
            )
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

    private _proceedTagsSpaces(dishDescription: string): string {
        return dishDescription.replaceAll(/<\s*\/\s*([abi])\s*>/g, '</$1>');
    }
}