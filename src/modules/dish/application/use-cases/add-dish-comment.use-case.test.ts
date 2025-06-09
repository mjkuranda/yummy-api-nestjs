import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../write/dish-write.service';
import { AddDishCommentUseCase } from './add-dish-comment.use-case';
import { CreateDishCommentBody } from '../../dish.dto';
import { DishNotFoundError, DishNotAcceptedError, DishSoftDeletedError } from '../../../../errors/domain';
import { NotFoundException, ForbiddenException } from '../../../../exceptions';

describe('AddDishCommentUseCase', () => {
    let useCase: AddDishCommentUseCase;
    let loggerService: LoggerService;
    let dishWriteService: DishWriteService;

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
    };

    const mockDishWriteService = {
        addDishComment: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AddDishCommentUseCase,
                { provide: LoggerService, useValue: mockLoggerService },
                { provide: DishWriteService, useValue: mockDishWriteService },
            ],
        }).compile();

        useCase = module.get<AddDishCommentUseCase>(AddDishCommentUseCase);
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
        const mockCommentBody: CreateDishCommentBody = {
            encodedDishId: 'encoded-dish-123',
            text: 'This is a test comment',
        };

        it('should successfully add a dish comment', async () => {
            mockDishWriteService.addDishComment.mockResolvedValue(undefined);

            await useCase.execute(mockCommentBody, mockUser);

            expect(dishWriteService.addDishComment).toHaveBeenCalledWith(mockCommentBody, mockUser);
            expect(loggerService.info).toHaveBeenCalledWith(
                'AddDishCommentUseCase/execute',
                `Successfully added a new comment to dish "${mockCommentBody.encodedDishId}" by "${mockUser}" user.`
            );
        });

        it('should throw NotFoundException when dish is not found', async () => {
            const error = new DishNotFoundError(mockCommentBody.encodedDishId);
            mockDishWriteService.addDishComment.mockRejectedValue(error);

            await expect(useCase.execute(mockCommentBody, mockUser))
                .rejects
                .toThrow(NotFoundException);
            await expect(useCase.execute(mockCommentBody, mockUser))
                .rejects
                .toThrow(`Dish "${mockCommentBody.encodedDishId}" not found`);
        });

        it('should throw ForbiddenException when dish is not accepted', async () => {
            const error = new DishNotAcceptedError(mockCommentBody.encodedDishId);
            mockDishWriteService.addDishComment.mockRejectedValue(error);

            await expect(useCase.execute(mockCommentBody, mockUser))
                .rejects
                .toThrow(ForbiddenException);
            await expect(useCase.execute(mockCommentBody, mockUser))
                .rejects
                .toThrow(`Dish "${mockCommentBody.encodedDishId}" has not been accepted`);
        });

        it('should throw ForbiddenException when dish is soft deleted', async () => {
            const error = new DishSoftDeletedError(mockCommentBody.encodedDishId);
            mockDishWriteService.addDishComment.mockRejectedValue(error);

            await expect(useCase.execute(mockCommentBody, mockUser))
                .rejects
                .toThrow(ForbiddenException);
            await expect(useCase.execute(mockCommentBody, mockUser))
                .rejects
                .toThrow(`Dish "${mockCommentBody.encodedDishId}" has been deleted`);
        });
    });
});