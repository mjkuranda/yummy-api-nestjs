import { Test, TestingModule } from '@nestjs/testing';
import { MealController } from './meal.controller';
import { MealService } from './meal.service';
import { TranslationService } from '../translation/translation.service';
import { Language } from '../../common/types';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { RedisService } from '../redis/redis.service';
import { LoggerService } from '../logger/logger.service';
import { IngredientService } from '../ingredient/ingredient.service';

describe('MealController', () => {
    let controller: MealController;
    let mealService: MealService;
    let translationService: TranslationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [JwtManagerModule],
            controllers: [MealController],
            providers: [
                {
                    provide: MealService,
                    useValue: {
                        getMealDetails: jest.fn()
                    },
                },
                {
                    provide: TranslationService,
                    useValue: {
                        translateMeal: jest.fn()
                    },
                },
                {
                    provide: IngredientService,
                    useValue: {
                        applyWithImages: jest.fn()
                    }
                },
                {
                    provide: RedisService,
                    useValue: {
                        set: jest.fn(),
                        get: jest.fn(),
                        del: jest.fn(),
                        setTokens: jest.fn(),
                        unsetTokens: jest.fn(),
                        getAccessToken: jest.fn(),
                        getRefreshToken: jest.fn()
                    }
                },
                {
                    provide: LoggerService,
                    useValue: {
                        info: jest.fn(),
                        error: jest.fn()
                    }
                }
            ],
        }).compile();

        controller = module.get<MealController>(MealController);
        mealService = module.get<MealService>(MealService);
        translationService = module.get<TranslationService>(TranslationService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
        expect(mealService).toBeDefined();
        expect(translationService).toBeDefined();
    });

    describe('getMealDetails', () => {
        it('should return detailed meal with translated ingredients', async () => {
            const id = '123';
            const lang: Language = 'en';
            const meal = { description: 'description', ingredients: ['ingredient1', 'ingredient2'], recipeSections: [] } as any;
            const translatedDescription = 'translated description' as string;
            const translatedIngredients = ['translated1', 'translated2'] as any;
            const translatedRecipe = ['translated1', 'translated2'] as any;
            const expectedResult = { meal, description: translatedDescription, ingredients: translatedIngredients, recipe: translatedRecipe };

            jest.spyOn(mealService, 'getMealDetails').mockResolvedValue(meal);
            jest.spyOn(translationService, 'translateMeal').mockResolvedValue(expectedResult);

            const result = await controller.getMealDetails(id, lang);

            expect(result).toEqual(expectedResult);
            expect(mealService.getMealDetails).toHaveBeenCalledWith(id);
            expect(translationService.translateMeal).toHaveBeenCalledWith(meal, lang);
        });
    });
});