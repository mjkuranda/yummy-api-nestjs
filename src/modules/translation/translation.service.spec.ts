import { Test, TestingModule } from '@nestjs/testing';
import { TranslationService } from './translation.service';
import translate from '@iamtraction/google-translate';
import { DetailedDish } from '../dish/dish.types';
import { MealType, DishType } from '../../common/enums';

jest.mock('@iamtraction/google-translate', () =>
    jest.fn((text, opts) => {
        return Promise.resolve({
            text: `mocked translation of ${text}`,
            ...(opts && opts.from && { from: opts.from }),
            ...(opts && opts.to && { to: opts.to }),
        });
    })
);

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

    describe('translateDish', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should translate a detailed dish', async () => {
            const mockDetailedDish: DetailedDish = {
                id: '123',
                type: DishType.ANY,
                mealType: MealType.ANY,
                title: 'Untitled',
                description: 'Lorem ipsum dolor sit amet.',
                language: 'en',
                provider: 'spoonacular',
                readyInMinutes: 75,
                sourceOrAuthor: 'unknown',
                ingredients: [
                    {
                        name: 'carrot',
                        unit: 'sticks',
                        amount: 3,
                        imageUrl: '1.jpg'
                    },
                    {
                        name: 'butter',
                        unit: 'gr',
                        amount: 200,
                        imageUrl: '2.jpg'
                    }
                ],
                recipeSections: [
                    {
                        name: '',
                        steps: ['A', 'B', 'C']
                    },
                    {
                        name: 'Final recipe',
                        steps: ['Q', 'W', 'E', 'R', 'T', 'Y']
                    },
                    {
                        name: 'Yet another one',
                        steps: ['Z', 'X', 'C', 'V']
                    }
                ]
            };

            const { description, ingredients, recipe } = await translationService.translateDish(mockDetailedDish, 'pl');

            // NOTE: Only description contains `mocked translation of` regarding concatenating all string into one.
            // NOTE: Hence, ingredients, steps and section names do not contain that fragment.

            expect(description).toEqual(`mocked translation of ${mockDetailedDish.description}`);
            expect(ingredients.length).toEqual(mockDetailedDish.ingredients.length);
            expect(recipe.length).toEqual(mockDetailedDish.recipeSections.length);
            expect(translate).toHaveBeenCalledTimes(1);
            expect(ingredients[0].text).toEqual('3 sticks of carrot');
            expect(ingredients[0].imageUrl).toEqual('1.jpg');
            expect(ingredients[1].text).toEqual('200 grams of butter');
            expect(ingredients[1].imageUrl).toEqual('2.jpg');
            expect(recipe[0].name).toEqual('');
            expect(recipe[0].steps.length).toEqual(3);
            expect(recipe[0].steps[0]).toEqual('A');
            expect(recipe[0].steps[1]).toEqual('B');
            expect(recipe[0].steps[2]).toEqual('C');
            expect(recipe[1].name).toEqual('Final recipe');
            expect(recipe[1].steps.length).toEqual(6);
            expect(recipe[1].steps[0]).toEqual('Q');
            expect(recipe[1].steps[1]).toEqual('W');
            expect(recipe[1].steps[2]).toEqual('E');
            expect(recipe[1].steps[3]).toEqual('R');
            expect(recipe[1].steps[4]).toEqual('T');
            expect(recipe[1].steps[5]).toEqual('Y');
            expect(recipe[2].name).toEqual('Yet another one');
            expect(recipe[2].steps.length).toEqual(4);
            expect(recipe[2].steps[0]).toEqual('Z');
            expect(recipe[2].steps[1]).toEqual('X');
            expect(recipe[2].steps[2]).toEqual('C');
            expect(recipe[2].steps[3]).toEqual('V');
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
            expect(translate).toHaveBeenCalledWith('xyz', { from: 'en', to: 'pl' });
            expect(text).toBe('mocked translation of xyz');
        });

        it('should set target language as \"en\" when provided language does not match', async () => {
            const simpleText = 'xyz';

            // as any to simulate unknown language
            await translationService.translate(simpleText, 'XXX' as any);

            expect(translate).toHaveBeenCalledTimes(1);
            expect(translate).toHaveBeenCalledWith('xyz', { from: 'en', to: 'en' });
        });
    });
});