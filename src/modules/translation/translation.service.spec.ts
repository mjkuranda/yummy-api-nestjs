import { Test, TestingModule } from '@nestjs/testing';
import { TranslationService } from './translation.service';
import { translate } from 'google-translate-api-x';
import { MealIngredient } from '../ingredient/ingredient.types';
import { TranslatedIngredient } from './translation.types';

jest.mock('google-translate-api-x', () => ({
    translate: jest.fn((text) => {
        return Promise.resolve({
            text: `mocked translation of ${text}`,
            from: { language: { iso: 'en' }},
            to: { language: { iso: 'es' }},
        });
    }),
}));

describe('TranslationService', () => {
    let translationService: TranslationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TranslationService],
        }).compile();

        translationService = module.get(TranslationService);
    });

    it('should be defined', () => {
        expect(translationService).toBeDefined();
    });

    describe('translateIngredients', () => {
        it('should translate array of ingredients', async () => {
            const ingredients: MealIngredient[] = [
                {
                    amount: 5,
                    unit: 'A',
                    name: 'M',
                    imageUrl: 'abc'
                }
            ];
            const expectedResult: TranslatedIngredient[] = [
                {
                    text: 'mocked translation of 5 A M',
                    imageUrl: 'abc'
                }
            ];

            const translatedIngredients = await translationService.translateIngredients(ingredients, 'pl');

            expect(translate).toHaveBeenCalledTimes(ingredients.length);
            expect(translatedIngredients).toStrictEqual(expectedResult);
        });
    });

    describe('translate', () => {
        it('should translate simple text', async () => {
            const simpleText = 'xyz';

            const text = await translationService.translate(simpleText, 'pl');

            expect(translate).toHaveBeenCalledTimes(1);
            expect(translate).toHaveBeenCalledWith('xyz', { to: 'pl' });
            expect(text).toBe('mocked translation of xyz');
        });
    });
});