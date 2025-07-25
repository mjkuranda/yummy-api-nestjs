import { PipeTransform, Injectable } from '@nestjs/common';
import { supportedLanguages } from '../constants/language.constant';
import { ContextString, Language } from '../common/types';
import { BadRequestException } from '../exceptions';

@Injectable()
export class LanguageValidationPipe implements PipeTransform {

    // context string

    transform(value: any): Language {
        const context: ContextString = 'LanguageValidationPipe/transform';

        if (typeof value !== 'string') {
            throw new BadRequestException(context, 'Language must be a string');
        }

        // FIXME: Do not use `as`. Remove after introducing type guard
        const lang = value.toLowerCase() as Language;

        // TODO: Type Guard for language
        if (!supportedLanguages.includes(lang)) {
            throw new BadRequestException(context, `Unsupported language: ${value}`);
        }

        return lang;
    }
}
