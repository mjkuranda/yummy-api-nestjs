import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../../logger/logger.service';
import { DishReadService } from '../../domain/read/dish-read.service';
import { GetDishCommentsUseCase } from './get-dish-comments.use-case';
import { DishNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { DishCommentDocument } from '../../../../mongodb/documents/dish-comment.document';
import { Document } from 'mongoose';

describe('GetDishCommentsUseCase', () => {
    let useCase: GetDishCommentsUseCase;
    let loggerService: LoggerService;
    let dishReadService: DishReadService;

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
    };

    const mockDishReadService = {
        getDishComments: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetDishCommentsUseCase,
                { provide: LoggerService, useValue: mockLoggerService },
                { provide: DishReadService, useValue: mockDishReadService },
            ],
        }).compile();

        useCase = module.get<GetDishCommentsUseCase>(GetDishCommentsUseCase);
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
        const mockComments = [
            {
                _id: 'comment-1',
                dishId: 'dish-1',
                text: 'Test comment 1',
                user: 'testUser1',
                posted: Date.now(),
            },
            {
                _id: 'comment-2',
                dishId: 'dish-1',
                text: 'Test comment 2',
                user: 'testUser2',
                posted: Date.now(),
            }
        ] as unknown as (DishCommentDocument & Document)[];

        it('should successfully get dish comments', async () => {
            mockDishReadService.getDishComments.mockResolvedValue(mockComments);

            const result = await useCase.execute(mockEncodedDishId);

            expect(result).toEqual(mockComments);
            expect(dishReadService.getDishComments).toHaveBeenCalledWith(mockEncodedDishId);
            expect(loggerService.info).toHaveBeenCalledWith(
                'GetDishCommentsUseCase/execute',
                `Successfully retrieved ${mockComments.length} comments for dish "${mockEncodedDishId}".`
            );
        });

        it('should return empty array when no comments are found', async () => {
            mockDishReadService.getDishComments.mockResolvedValue([]);

            const result = await useCase.execute(mockEncodedDishId);

            expect(result).toEqual([]);
            expect(dishReadService.getDishComments).toHaveBeenCalledWith(mockEncodedDishId);
            expect(loggerService.info).toHaveBeenCalledWith(
                'GetDishCommentsUseCase/execute',
                `Successfully retrieved 0 comments for dish "${mockEncodedDishId}".`
            );
        });

        it('should throw NotFoundException when dish is not found', async () => {
            const error = new DishNotFoundError(mockEncodedDishId);
            mockDishReadService.getDishComments.mockRejectedValue(error);

            await expect(useCase.execute(mockEncodedDishId))
                .rejects
                .toThrow(NotFoundException);
            await expect(useCase.execute(mockEncodedDishId))
                .rejects
                .toThrow(`Dish "${mockEncodedDishId}" not found`);
        });

        it('should throw BadRequestException when dish ID is invalid', async () => {
            const error = new InvalidDishIdError(mockEncodedDishId);
            mockDishReadService.getDishComments.mockRejectedValue(error);

            await expect(useCase.execute(mockEncodedDishId))
                .rejects
                .toThrow(BadRequestException);
            await expect(useCase.execute(mockEncodedDishId))
                .rejects
                .toThrow(`Invalid dish ID "${mockEncodedDishId}"`);
        });
    });
});