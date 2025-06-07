import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../../logger/logger.service';
import { DishReadService } from '../../read/dish-read.service';
import { TranslationService } from '../../../translation/translation.service';
import { GetDishDetailsUseCase } from './get-dish-details.use-case';
import { DishNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { DishType, MealType, Provider } from '../../../../common/enums';
import { DetailedDish } from '../../dish.types';
import { DishIngredient } from '../../../ingredient/ingredient.types';

describe('GetDishDetailsUseCase', () => {
    let useCase: GetDishDetailsUseCase;
    let loggerService: LoggerService;
    let dishReadService: DishReadService;
    let translationService: TranslationService;

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
    };

    const mockDishReadService = {
        getDishDetails: jest.fn(),
    };

    const mockTranslationService = {
        translateDish: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetDishDetailsUseCase,
                { provide: DishReadService, useValue: mockDishReadService },
                { provide: TranslationService, useValue: mockTranslationService },
                { provide: LoggerService, useValue: mockLoggerService },
            ],
        }).compile();

        useCase = module.get<GetDishDetailsUseCase>(GetDishDetailsUseCase);
        loggerService = module.get<LoggerService>(LoggerService);
        dishReadService = module.get<DishReadService>(DishReadService);
        translationService = module.get<TranslationService>(TranslationService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
        expect(loggerService).toBeDefined();
        expect(dishReadService).toBeDefined();
        expect(translationService).toBeDefined();
    });

    describe('execute', () => {
        const mockEncodedDishId = 'encoded-dish-123';
        const mockLanguage = 'pl';
        const mockDish: DetailedDish = {
            title: 'Test Dish',
            description: 'Test Description',
            ingredients: [{
                name: 'ingredient1',
                amount: 2,
                unit: 'pieces',
                imageUrl: 'http://example.com/ingredient1.jpg'
            }] as DishIngredient[],
            language: 'en',
            type: DishType.MAIN_COURSE,
            mealType: MealType.DINNER,
            readyInMinutes: 45,
            imgUrl: 'http://example.com/dish.jpg',
            sourceOrAuthor: 'testUser',
            provider: Provider.INT_DMT_USER,
            properties: {
                vegetarian: true,
                vegan: false,
                glutenFree: true,
                dairyFree: false,
                veryHealthy: true
            }
        };

        const mockTranslatedDish = {
            title: 'Danie Testowe',
            description: 'Opis Testowy',
            ingredients: [{
                ...mockDish.ingredients[0],
                name: 'składnik1'
            }]
        };

        it('should successfully get dish details with translation', async () => {
            mockDishReadService.getDishDetails.mockResolvedValue({
                dish: mockDish,
                fromCache: true
            });
            mockTranslationService.translateDish.mockResolvedValue(mockTranslatedDish);

            const result = await useCase.execute(mockEncodedDishId, mockLanguage);

            expect(result).toEqual({
                ...mockDish,
                ...mockTranslatedDish,
                language: {
                    original: mockDish.language,
                    translated: mockLanguage
                },
                ingredients: {
                    original: mockDish.ingredients,
                    translated: mockTranslatedDish.ingredients
                }
            });
            expect(dishReadService.getDishDetails).toHaveBeenCalledWith(mockEncodedDishId);
            expect(translationService.translateDish).toHaveBeenCalledWith(mockDish, mockLanguage);
            expect(loggerService.info).toHaveBeenCalledWith(
                'GetDishDetailsUseCase/execute',
                `Dish with "${mockEncodedDishId}" ID loaded from cache.`
            );
        });

        it('should log correct message when dish is loaded from provider', async () => {
            mockDishReadService.getDishDetails.mockResolvedValue({
                dish: mockDish,
                fromCache: false
            });
            mockTranslationService.translateDish.mockResolvedValue(mockTranslatedDish);

            await useCase.execute(mockEncodedDishId, mockLanguage);

            expect(loggerService.info).toHaveBeenCalledWith(
                'GetDishDetailsUseCase/execute',
                `Dish with "${mockEncodedDishId}" ID loaded from provider and cached.`
            );
        });

        it('should throw NotFoundException when dish is not found', async () => {
            const error = new DishNotFoundError(mockEncodedDishId);
            mockDishReadService.getDishDetails.mockRejectedValue(error);

            await expect(useCase.execute(mockEncodedDishId, mockLanguage))
                .rejects
                .toThrow(NotFoundException);
            expect(loggerService.error).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when dish ID is invalid', async () => {
            const error = new InvalidDishIdError(mockEncodedDishId);
            mockDishReadService.getDishDetails.mockRejectedValue(error);

            await expect(useCase.execute(mockEncodedDishId, mockLanguage))
                .rejects
                .toThrow(BadRequestException);
            expect(loggerService.error).not.toHaveBeenCalled();
        });
    });
});