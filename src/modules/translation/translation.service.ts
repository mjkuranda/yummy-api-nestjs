import { Injectable } from '@nestjs/common';
import { translate } from 'google-translate-api-x';

@Injectable()
export class TranslationService {
    async translate(text: string, targetLanguage: string): Promise<string> {
        const result = await translate(text, { to: targetLanguage });

        return result.text;
    }
}