import { Test, TestingModule } from '@nestjs/testing';
import { DishReadService } from '../../domain/read/dish-read.service';
import { GetDishesWithSoftAddedUseCase } from './get-dishes-with-soft-added.use-case';
import { DishDocument } from '../../../../mongodb/documents/dish.document';
import { Document } from 'mongoose';
import { DishType, MealType, Provider } from '../../../../common/enums';

describe('GetDishesWithSoftAddedUseCase', () => {
    let useCase: GetDishesWithSoftAddedUseCase;
    let dishReadService: DishReadService;

    const mockDishReadService = {
        getDishesWithSoftAdded: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetDishesWithSoftAddedUseCase,
                { provide: DishReadService, useValue: mockDishReadService },
            ],
        }).compile();

        useCase = module.get<GetDishesWithSoftAddedUseCase>(GetDishesWithSoftAddedUseCase);
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
                softAdded: true,
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
                softAdded: true,
            }
        ] as unknown as (DishDocument & Document)[];

        it('should successfully get dishes with soft added status', async () => {
            mockDishReadService.getDishesWithSoftAdded.mockResolvedValue(mockDishes);

            const result = await useCase.execute();

            expect(result).toEqual(mockDishes);
            expect(dishReadService.getDishesWithSoftAdded).toHaveBeenCalled();
        });

        it('should return empty array when no dishes are found', async () => {
            mockDishReadService.getDishesWithSoftAdded.mockResolvedValue([]);

            const result = await useCase.execute();

            expect(result).toEqual([]);
            expect(dishReadService.getDishesWithSoftAdded).toHaveBeenCalled();
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            mockDishReadService.getDishesWithSoftAdded.mockRejectedValue(error);

            await expect(useCase.execute()).rejects.toThrow(error);
            expect(dishReadService.getDishesWithSoftAdded).toHaveBeenCalled();
        });
    });
});