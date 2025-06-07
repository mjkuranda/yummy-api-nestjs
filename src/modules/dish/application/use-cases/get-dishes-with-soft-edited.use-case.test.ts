import { Test, TestingModule } from '@nestjs/testing';
import { DishReadService } from '../../read/dish-read.service';
import { GetDishesWithSoftEditedUseCase } from './get-dishes-with-soft-edited.use-case';
import { DishDocument } from '../../../../mongodb/documents/dish.document';
import { Document } from 'mongoose';
import { DishType, MealType, Provider } from '../../../../common/enums';

describe('GetDishesWithSoftEditedUseCase', () => {
    let useCase: GetDishesWithSoftEditedUseCase;
    let dishReadService: DishReadService;

    const mockDishReadService = {
        getDishesWithSoftEdited: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetDishesWithSoftEditedUseCase,
                { provide: DishReadService, useValue: mockDishReadService },
            ],
        }).compile();

        useCase = module.get<GetDishesWithSoftEditedUseCase>(GetDishesWithSoftEditedUseCase);
        dishReadService = module.get<DishReadService>(DishReadService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
        expect(dishReadService).toBeDefined();
    });

    describe('execute', () => {
        const mockDishes = [
            {
                _id: 'dish-1',
                title: 'Test Dish 1',
                description: 'Test Description 1',
                ingredients: [],
                language: 'en',
                type: DishType.MAIN_COURSE,
                mealType: MealType.DINNER,
                readyInMinutes: 30,
                imageUrl: 'http://example.com/dish1.jpg',
                author: 'testUser',
                provider: Provider.INT_DMT_USER,
                posted: Date.now(),
                softEdited: true,
            },
            {
                _id: 'dish-2',
                title: 'Test Dish 2',
                description: 'Test Description 2',
                ingredients: [],
                language: 'en',
                type: DishType.MAIN_COURSE,
                mealType: MealType.DINNER,
                readyInMinutes: 45,
                imageUrl: 'http://example.com/dish2.jpg',
                author: 'testUser',
                provider: Provider.INT_DMT_USER,
                posted: Date.now(),
                softEdited: true,
            }
        ] as unknown as (DishDocument & Document)[];

        it('should successfully get dishes with soft edited status', async () => {
            mockDishReadService.getDishesWithSoftEdited.mockResolvedValue(mockDishes);

            const result = await useCase.execute();

            expect(result).toEqual(mockDishes);
            expect(dishReadService.getDishesWithSoftEdited).toHaveBeenCalled();
        });

        it('should return empty array when no dishes are found', async () => {
            mockDishReadService.getDishesWithSoftEdited.mockResolvedValue([]);

            const result = await useCase.execute();

            expect(result).toEqual([]);
            expect(dishReadService.getDishesWithSoftEdited).toHaveBeenCalled();
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            mockDishReadService.getDishesWithSoftEdited.mockRejectedValue(error);

            await expect(useCase.execute()).rejects.toThrow(error);
            expect(dishReadService.getDishesWithSoftEdited).toHaveBeenCalled();
        });
    });
});