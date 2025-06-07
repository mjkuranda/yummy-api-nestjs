import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../../logger/logger.service';
import { DishReadService } from '../../read/dish-read.service';
import { IngredientService } from '../../../ingredient/ingredient.service';
import { GetDishesUseCase } from './get-dishes.use-case';
import { IngredientType } from '../../../ingredient/ingredient.types';
import { MealType, DishType, Provider } from '../../../../common/enums';
import { RatedDish } from '../../dish.types';

describe('GetDishesUseCase', () => {
    let useCase: GetDishesUseCase;
    let loggerService: LoggerService;
    let dishReadService: DishReadService;
    let ingredientService: IngredientService;

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
    };

    const mockDishReadService = {
        getDishes: jest.fn(),
    };

    const mockIngredientService = {
        filterIngredients: jest.fn((ingredients: IngredientType[]) => ingredients),
        getAllPantryIngredients: jest.fn(),
    };

    beforeEach(async () => {
        // Reset mock implementations before each test
        // mockIngredientService.filterIngredients.mockImplementation(ingredients => ingredients);
        // mockIngredientService.getAllPantryIngredients.mockReturnValue([]);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetDishesUseCase,
                {
                    provide: IngredientService,
                    useValue: mockIngredientService,
                },
                {
                    provide: DishReadService,
                    useValue: mockDishReadService,
                },
                {
                    provide: LoggerService,
                    useValue: mockLoggerService,
                },
            ],
        }).compile();

        useCase = module.get<GetDishesUseCase>(GetDishesUseCase);
        loggerService = module.get<LoggerService>(LoggerService);
        dishReadService = module.get<DishReadService>(DishReadService);
        ingredientService = module.get<IngredientService>(IngredientService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
        expect(loggerService).toBeDefined();
        expect(dishReadService).toBeDefined();
        expect(ingredientService).toBeDefined();
    });

    describe('execute', () => {
        const mockIngredients: string[] = ['tomato', 'onion'];
        const mockFilteredIngredients = ['tomato', 'onion'];
        const mockPantryIngredients = ['salt', 'pepper', 'oil'];
        const mockMealType = MealType.DINNER;
        const mockRatedDishes: RatedDish[] = [
            {
                encodedDishId: 'dish-1',
                title: 'Test Dish 1',
                ingredients: ['tomato', 'onion', 'garlic'],
                missingCount: 1,
                language: 'en',
                provider: Provider.INT_DMT_USER,
                relevance: 0.8,
                type: DishType.MAIN_COURSE,
                mealType: MealType.DINNER,
            },
            {
                encodedDishId: 'dish-2',
                title: 'Test Dish 2',
                ingredients: ['tomato', 'garlic', 'basil'],
                missingCount: 2,
                language: 'en',
                provider: Provider.INT_DMT_USER,
                relevance: 0.6,
                type: DishType.MAIN_COURSE,
                mealType: MealType.DINNER,
            },
        ];

        beforeEach(() => {
            // Reset mock implementations for each test
            mockIngredientService.filterIngredients.mockReturnValue(mockFilteredIngredients);
            mockIngredientService.getAllPantryIngredients.mockReturnValue(mockPantryIngredients);
        });

        it('should successfully get dishes from cache', async () => {
            mockDishReadService.getDishes.mockResolvedValue({
                dishes: mockRatedDishes,
                fromCache: true,
            });

            const result = await useCase.execute(mockIngredients, mockMealType);

            expect(result).toEqual(mockRatedDishes);
            expect(ingredientService.filterIngredients).toHaveBeenCalledWith(mockIngredients);
            expect(ingredientService.getAllPantryIngredients).toHaveBeenCalled();
            expect(dishReadService.getDishes).toHaveBeenCalledWith(
                mockFilteredIngredients,
                [...mockFilteredIngredients, ...mockPantryIngredients],
                mockMealType
            );
            expect(loggerService.info).toHaveBeenCalledWith(
                'GetDishesUseCase/execute',
                `Returned ${mockRatedDishes.length} dishes from cache, defined for ingredients: ${mockFilteredIngredients.join(', ')}.`
            );
        });

        it('should successfully get dishes from provider', async () => {
            mockDishReadService.getDishes.mockResolvedValue({
                dishes: mockRatedDishes,
                fromCache: false,
            });

            const result = await useCase.execute(mockIngredients, mockMealType);

            expect(result).toEqual(mockRatedDishes);
            expect(ingredientService.filterIngredients).toHaveBeenCalledWith(mockIngredients);
            expect(ingredientService.getAllPantryIngredients).toHaveBeenCalled();
            expect(dishReadService.getDishes).toHaveBeenCalledWith(
                mockFilteredIngredients,
                [...mockFilteredIngredients, ...mockPantryIngredients],
                mockMealType
            );
            expect(loggerService.info).toHaveBeenCalledWith(
                'GetDishesUseCase/execute',
                `Returned ${mockRatedDishes.length} dishes from provider and cached, defined for ingredients: ${mockFilteredIngredients.join(', ')}.`
            );
        });

        it('should return empty array when no dishes are found', async () => {
            mockDishReadService.getDishes.mockResolvedValue({
                dishes: [],
                fromCache: true,
            });

            const result = await useCase.execute(mockIngredients, mockMealType);

            expect(result).toEqual([]);
            expect(ingredientService.filterIngredients).toHaveBeenCalledWith(mockIngredients);
            expect(ingredientService.getAllPantryIngredients).toHaveBeenCalled();
            expect(dishReadService.getDishes).toHaveBeenCalledWith(
                mockFilteredIngredients,
                [...mockFilteredIngredients, ...mockPantryIngredients],
                mockMealType
            );
            expect(loggerService.info).toHaveBeenCalledWith(
                'GetDishesUseCase/execute',
                `Returned 0 dishes from cache, defined for ingredients: ${mockFilteredIngredients.join(', ')}.`
            );
        });
    });
});