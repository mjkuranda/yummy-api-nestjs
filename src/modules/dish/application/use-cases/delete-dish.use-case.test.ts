import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../write/dish-write.service';
import { DeleteDishUseCase } from './delete-dish.use-case';
import { DishNotFoundError } from '../../../../errors/domain/dish-not-found.error';
import { InvalidDishIdError } from '../../../../errors/domain/invalid-dish-id.error';
import { DishDeletionFailedError } from '../../../../errors/domain/dish-deletion-failed.error';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { InternalServerException } from '../../../../exceptions/internal-server.exception';

describe('DeleteDishUseCase', () => {
    let useCase: DeleteDishUseCase;
    let loggerService: LoggerService;
    let dishWriteService: DishWriteService;

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
    };

    const mockDishWriteService = {
        deleteDish: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteDishUseCase,
                { provide: LoggerService, useValue: mockLoggerService },
                { provide: DishWriteService, useValue: mockDishWriteService },
            ],
        }).compile();

        useCase = module.get<DeleteDishUseCase>(DeleteDishUseCase);
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
        const mockEncodedDishId = 'encoded-dish-123';
        const mockDishTitle = 'Test Dish';

        it('should successfully delete a dish', async () => {
            mockDishWriteService.deleteDish.mockResolvedValue({
                dishTitle: mockDishTitle,
                isSoftDeleted: true
            });

            const result = await useCase.execute(mockEncodedDishId);

            expect(result).toBe(true);
            expect(dishWriteService.deleteDish).toHaveBeenCalledWith(mockEncodedDishId);
            expect(loggerService.info).toHaveBeenCalledWith(
                'DeleteDishUseCase/execute',
                `Dish with id "${mockEncodedDishId}" (titled: "${mockDishTitle}") has been marked as soft-deleted.`
            );
        });

        it('should throw NotFoundException when dish is not found', async () => {
            const error = new DishNotFoundError(mockEncodedDishId);
            mockDishWriteService.deleteDish.mockRejectedValue(error);

            await expect(useCase.execute(mockEncodedDishId))
                .rejects
                .toThrow(NotFoundException);
            await expect(useCase.execute(mockEncodedDishId))
                .rejects
                .toThrow(`Dish "${mockEncodedDishId}" not found`);
        });

        it('should throw BadRequestException when dish ID is invalid', async () => {
            const error = new InvalidDishIdError(mockEncodedDishId);
            mockDishWriteService.deleteDish.mockRejectedValue(error);

            await expect(useCase.execute(mockEncodedDishId))
                .rejects
                .toThrow(BadRequestException);
            await expect(useCase.execute(mockEncodedDishId))
                .rejects
                .toThrow(`Invalid dish ID "${mockEncodedDishId}"`);
        });

        it('should throw InternalServerException when dish deletion fails', async () => {
            const error = new DishDeletionFailedError(mockEncodedDishId);
            mockDishWriteService.deleteDish.mockRejectedValue(error);

            await expect(useCase.execute(mockEncodedDishId))
                .rejects
                .toThrow(InternalServerException);
            await expect(useCase.execute(mockEncodedDishId))
                .rejects
                .toThrow(`Failed to delete dish "${mockEncodedDishId}"`);
        });

        it('should handle unsuccessful deletion', async () => {
            mockDishWriteService.deleteDish.mockResolvedValue({
                dishTitle: mockDishTitle,
                isSoftDeleted: false
            });

            const result = await useCase.execute(mockEncodedDishId);

            expect(result).toBe(false);
            expect(dishWriteService.deleteDish).toHaveBeenCalledWith(mockEncodedDishId);
            expect(loggerService.error).toHaveBeenCalledWith(
                'DeleteDishUseCase/execute',
                `Dish with id "${mockEncodedDishId}" (titled: "${mockDishTitle}") has not been marked as soft-deleted.`
            );
        });
    });
});