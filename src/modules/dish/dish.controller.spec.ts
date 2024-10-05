import { Test, TestingModule } from '@nestjs/testing';
import { DishController } from './dish.controller';
import { DishService } from './dish.service';
import { TranslationService } from '../translation/translation.service';
import { Language } from '../../common/types';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { RedisService } from '../redis/redis.service';
import { LoggerService } from '../logger/logger.service';
import { IngredientService } from '../ingredient/ingredient.service';

describe('DishController', () => {
    let controller: DishController;
    let dishService: DishService;
    let translationService: TranslationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [JwtManagerModule],
            controllers: [DishController],
            providers: [
                {
                    provide: DishService,
                    useValue: {
                        getDishDetails: jest.fn()
                    },
                },
                {
                    provide: TranslationService,
                    useValue: {
                        translateDish: jest.fn()
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

        controller = module.get<DishController>(DishController);
        dishService = module.get<DishService>(DishService);
        translationService = module.get<TranslationService>(TranslationService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
        expect(dishService).toBeDefined();
        expect(translationService).toBeDefined();
    });

    describe('getDishDetails', () => {
        it('should return detailed dish with translated ingredients', async () => {
            const id = '123';
            const lang: Language = 'en';
            const dish = { description: 'description', ingredients: ['ingredient1', 'ingredient2'], recipeSections: [] } as any;
            const translatedDescription = 'translated description' as string;
            const translatedIngredients = ['translated1', 'translated2'] as any;
            const translatedRecipe = ['translated1', 'translated2'] as any;
            const expectedResult = { dish, description: translatedDescription, ingredients: translatedIngredients, recipe: translatedRecipe };

            jest.spyOn(dishService, 'getDishDetails').mockResolvedValue(dish);
            jest.spyOn(translationService, 'translateDish').mockResolvedValue(expectedResult);

            const result = await controller.getDishDetails(id, lang);

            expect(result).toEqual(expectedResult);
            expect(dishService.getDishDetails).toHaveBeenCalledWith(id);
            expect(translationService.translateDish).toHaveBeenCalledWith(dish, lang);
        });
    });
});