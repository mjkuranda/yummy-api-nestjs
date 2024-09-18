import { Test, TestingModule } from '@nestjs/testing';
import { TranslationService } from './translation.service';
import { translate } from 'google-translate-api-x';
import { MealIngredient } from '../ingredient/ingredient.types';
import { TranslatedIngredient } from './translation.types';
import { MealRecipeSections } from '../meal/meal.types';

jest.mock('google-translate-api-x', () => ({
    translate: jest.fn((text, opts) => {
        return Promise.resolve({
            text: `mocked translation of ${text}`,
            ...(opts && opts.from && { from: opts.from }),
            ...(opts && opts.to && { to: opts.to }),
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

    describe('translateRecipe', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should translate array of recipe sections', async () => {
            const sections: MealRecipeSections = [
                {
                    name: 'X',
                    steps: ['Y', 'Z']
                }
            ];
            const expectedResult: MealRecipeSections = [
                {
                    name: 'X',
                    steps: ['mocked translation of Y', 'mocked translation of Z']
                }
            ];

            const translatedRecipeSections = await translationService.translateRecipe(sections, 'pl');

            expect(translate).toHaveBeenCalledTimes(sections[0].steps.length);
            expect(translatedRecipeSections).toStrictEqual(expectedResult);
        });
    });

    describe('translateIngredients', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

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
                    text: 'mocked translation of 5 A of M',
                    imageUrl: 'abc'
                }
            ];

            const translatedIngredients = await translationService.translateIngredients(ingredients, 'pl');

            expect(translate).toHaveBeenCalledTimes(ingredients.length);
            expect(translatedIngredients).toStrictEqual(expectedResult);
        });

        it('should translate array of ingredients without unit', async () => {
            const ingredients: MealIngredient[] = [
                {
                    amount: 5,
                    unit: '',
                    name: 'M',
                    imageUrl: 'abc'
                }
            ];
            const expectedResult: TranslatedIngredient[] = [
                {
                    text: 'mocked translation of 5 M',
                    imageUrl: 'abc'
                }
            ];

            const translatedIngredients = await translationService.translateIngredients(ingredients, 'pl');

            expect(translate).toHaveBeenCalledTimes(ingredients.length);
            expect(translatedIngredients).toStrictEqual(expectedResult);
        });
    });

    describe('translate', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should translate simple text', async () => {
            const simpleText = 'xyz';

            const text = await translationService.translate(simpleText, 'pl');

            expect(translate).toHaveBeenCalledTimes(1);
            expect(translate).toHaveBeenCalledWith('xyz', { to: 'pl' });
            expect(text).toBe('mocked translation of xyz');
        });

        it('should set target language as \"en\" when provided language does not match', async () => {
            const simpleText = 'xyz';

            // as any to simulate unknown language
            await translationService.translate(simpleText, 'XXX' as any);

            expect(translate).toHaveBeenCalledTimes(1);
            expect(translate).toHaveBeenCalledWith('xyz', { to: 'en' });
        });
    });
});