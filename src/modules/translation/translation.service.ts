import { Injectable } from '@nestjs/common';
import { translate } from 'google-translate-api-x';
import { MealIngredient } from '../ingredient/ingredient.types';
import { Language } from '../../common/types';
import { TranslatedIngredient } from './translation.types';

@Injectable()
export class TranslationService {

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