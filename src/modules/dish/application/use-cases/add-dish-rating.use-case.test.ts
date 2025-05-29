import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../write/dish-write.service';
import { AddDishRatingUseCase } from './add-dish-rating.use-case';
import { CreateDishRatingBody } from '../../dish.dto';
import { DishNotFoundError } from '../../../../errors/domain/dish-not-found.error';
import { InvalidDishIdError } from '../../../../errors/domain/invalid-dish-id.error';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { DishRatingDocument } from '../../../../mongodb/documents/dish-rating.document';
import { Document } from 'mongoose';

describe('AddDishRatingUseCase', () => {
    let useCase: AddDishRatingUseCase;
    let loggerService: LoggerService;
    let dishWriteService: DishWriteService;

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
    };

    const mockDishWriteService = {
        addDishRating: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AddDishRatingUseCase,
                { provide: LoggerService, useValue: mockLoggerService },
                { provide: DishWriteService, useValue: mockDishWriteService },
            ],
        }).compile();

        useCase = module.get<AddDishRatingUseCase>(AddDishRatingUseCase);
        loggerService = module.get<LoggerService>(LoggerService);
        dishWriteService = module.get<DishWriteService>(DishWriteService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
        expect(loggerService).toBeDefined();
        expect(dishWriteService).toBeDefined();
    });

    describe('execute', () => {
        const mockUser = 'testUser';
        const mockRatingBody: CreateDishRatingBody = {
            encodedDishId: 'encoded-dish-123',
            rating: 4.5,
        };
        const mockRatingDocument = {
            _id: 'rating-1',
            dishId: 'dish-1',
            rating: 4.5,
            user: mockUser,
            posted: Date.now(),
        } as unknown as (DishRatingDocument & Document);

        it('should successfully add a dish rating', async () => {
            mockDishWriteService.addDishRating.mockResolvedValue({
                dishRating: mockRatingDocument,
                isNew: true
            });

            const result = await useCase.execute(mockRatingBody, mockUser);

            expect(result).toEqual(mockRatingDocument);
            expect(dishWriteService.addDishRating).toHaveBeenCalledWith(mockRatingBody, mockUser);
            expect(loggerService.info).toHaveBeenCalledWith(
                'AddDishRatingUseCase/execute',
                `Successfully added a new rating for dish "${mockRatingBody.encodedDishId}" by "${mockUser}" user.`
            );
        });

        it('should successfully update an existing dish rating', async () => {
            mockDishWriteService.addDishRating.mockResolvedValue({
                dishRating: mockRatingDocument,
                isNew: false
            });

            const result = await useCase.execute(mockRatingBody, mockUser);

            expect(result).toEqual(mockRatingDocument);
            expect(dishWriteService.addDishRating).toHaveBeenCalledWith(mockRatingBody, mockUser);
            expect(loggerService.info).toHaveBeenCalledWith(
                'AddDishRatingUseCase/execute',
                `Successfully changed a rating for dish "${mockRatingBody.encodedDishId}" by "${mockUser}" user.`
            );
        });

        it('should throw NotFoundException when dish is not found', async () => {
            const error = new DishNotFoundError(mockRatingBody.encodedDishId);
            mockDishWriteService.addDishRating.mockRejectedValue(error);

            await expect(useCase.execute(mockRatingBody, mockUser))
                .rejects
                .toThrow(NotFoundException);
            await expect(useCase.execute(mockRatingBody, mockUser))
                .rejects
                .toThrow(`Dish "${mockRatingBody.encodedDishId}" not found`);
        });

        it('should throw BadRequestException when dish ID is invalid', async () => {
            const error = new InvalidDishIdError(mockRatingBody.encodedDishId);
            mockDishWriteService.addDishRating.mockRejectedValue(error);

            await expect(useCase.execute(mockRatingBody, mockUser))
                .rejects
                .toThrow(BadRequestException);
            await expect(useCase.execute(mockRatingBody, mockUser))
                .rejects
                .toThrow(`Invalid dish ID "${mockRatingBody.encodedDishId}"`);
        });
    });
});