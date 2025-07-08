import { Test, TestingModule } from '@nestjs/testing';
import { TranslationService } from './translation.service';
import translate from '@iamtraction/google-translate';
import { Provider, DishType, MealType } from '../../common/enums';
import { RecipeEntity } from '../recipe/domain/entities';
import { DishDetailsVo } from '../dish/domain/read/vos';
import { DishId } from '../dish/dish.types';

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
            const mockDetailedDish: DishDetailsVo = new DishDetailsVo(
                'Untitled',
                'Lorem ipsum dolor sit amet.',
                [
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
                75,
                'unknown',
                'en',
                Provider.EXT_API_SPOONACULAR,
                DishType.ANY,
                MealType.ANY,
                false,
                false
            );

            const { description, translatedIngredients } = await translationService.translateDish(mockDetailedDish, 'pl');

            // NOTE: Only description contains `mocked translation of` regarding concatenating all string into one.
            // NOTE: Hence, ingredients does not contain that fragment.

            expect(description).toEqual(`mocked translation of ${mockDetailedDish.description}`);
            expect(translatedIngredients.length).toEqual(mockDetailedDish.ingredients.length);
            expect(translate).toHaveBeenCalledTimes(1);
            expect(translatedIngredients[0].text).toEqual('3 sticks of carrot');
            expect(translatedIngredients[0].imageUrl).toEqual('1.jpg');
            expect(translatedIngredients[1].text).toEqual('200 grams of butter');
            expect(translatedIngredients[1].imageUrl).toEqual('2.jpg');
        });
    });

    describe('translateDishRecipe', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should return correct translation', async () => {
            const mockRecipeEntity: RecipeEntity = new RecipeEntity(
                'en',
                '123' as unknown as DishId,
                [
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
            );
            const expectedStartWith = 'mocked translation of ';

            const { translated: translatedRecipe } = await translationService.translateRecipe(mockRecipeEntity, 'pl');

            expect(translatedRecipe.sections[0].name).toEqual('');
            expect(translatedRecipe.sections[0].steps.length).toEqual(3);
            expect(translatedRecipe.sections[0].steps[0]).toEqual(expectedStartWith + 'A');
            expect(translatedRecipe.sections[0].steps[1]).toEqual('B');
            expect(translatedRecipe.sections[0].steps[2]).toEqual('C');
            expect(translatedRecipe.sections[1].name).toEqual('Final recipe');
            expect(translatedRecipe.sections[1].steps.length).toEqual(6);
            expect(translatedRecipe.sections[1].steps[0]).toEqual('Q');
            expect(translatedRecipe.sections[1].steps[1]).toEqual('W');
            expect(translatedRecipe.sections[1].steps[2]).toEqual('E');
            expect(translatedRecipe.sections[1].steps[3]).toEqual('R');
            expect(translatedRecipe.sections[1].steps[4]).toEqual('T');
            expect(translatedRecipe.sections[1].steps[5]).toEqual('Y');
            expect(translatedRecipe.sections[2].name).toEqual('Yet another one');
            expect(translatedRecipe.sections[2].steps.length).toEqual(4);
            expect(translatedRecipe.sections[2].steps[0]).toEqual('Z');
            expect(translatedRecipe.sections[2].steps[1]).toEqual('X');
            expect(translatedRecipe.sections[2].steps[2]).toEqual('C');
            expect(translatedRecipe.sections[2].steps[3]).toEqual('V');
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