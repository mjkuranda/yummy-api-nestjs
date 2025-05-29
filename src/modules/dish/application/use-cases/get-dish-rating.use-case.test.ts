import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../../logger/logger.service';
import { DishReadService } from '../../read/dish-read.service';
import { GetDishRatingUseCase } from './get-dish-rating.use-case';
import { DishNotFoundError } from '../../../../errors/domain/dish-not-found.error';
import { InvalidDishIdError } from '../../../../errors/domain/invalid-dish-id.error';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { DishRating } from '../../dish.types';

describe('GetDishRatingUseCase', () => {
    let useCase: GetDishRatingUseCase;
    let loggerService: LoggerService;
    let dishReadService: DishReadService;

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
    };

    const mockDishReadService = {
        getDishRating: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetDishRatingUseCase,
                { provide: LoggerService, useValue: mockLoggerService },
                { provide: DishReadService, useValue: mockDishReadService },
            ],
        }).compile();

        useCase = module.get<GetDishRatingUseCase>(GetDishRatingUseCase);
        loggerService = module.get<LoggerService>(LoggerService);
        dishReadService = module.get<DishReadService>(DishReadService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
        expect(loggerService).toBeDefined();
        expect(dishReadService).toBeDefined();
    });

    describe('execute', () => {
        const mockEncodedDishId = 'encoded-dish-123';
        const mockRating: DishRating = {
            dishId: mockEncodedDishId,
            rating: 4.5,
            count: 10
        };

        it('should successfully get dish rating', async () => {
            mockDishReadService.getDishRating.mockResolvedValue(mockRating);

            const result = await useCase.execute(mockEncodedDishId);

            expect(result).toEqual(mockRating);
            expect(dishReadService.getDishRating).toHaveBeenCalledWith(mockEncodedDishId);
            expect(loggerService.info).toHaveBeenCalledWith(
                'GetDishRatingUseCase/execute',
                `Calculated rating for dish "${mockEncodedDishId}" on ${mockRating.rating}.`
            );
        });

        it('should throw NotFoundException when dish is not found', async () => {
            const error = new DishNotFoundError(mockEncodedDishId);
            mockDishReadService.getDishRating.mockRejectedValue(error);

            await expect(useCase.execute(mockEncodedDishId))
                .rejects
                .toThrow(NotFoundException);
            await expect(useCase.execute(mockEncodedDishId))
                .rejects
                .toThrow(`Dish "${mockEncodedDishId}" not found`);
        });

        it('should throw BadRequestException when dish ID is invalid', async () => {
            const error = new InvalidDishIdError(mockEncodedDishId);
            mockDishReadService.getDishRating.mockRejectedValue(error);

            await expect(useCase.execute(mockEncodedDishId))
                .rejects
                .toThrow(BadRequestException);
            await expect(useCase.execute(mockEncodedDishId))
                .rejects
                .toThrow(`Invalid dish ID "${mockEncodedDishId}"`);
        });
    });
});