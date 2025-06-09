import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../domain/write/dish-write.service';
import { ConfirmDishDeletionUseCase } from './confirm-dish-deletion.use-case';
import { UserDto } from '../../../user/user.dto';
import { DishNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { NotFoundException, BadRequestException } from '../../../../exceptions';

describe('ConfirmDishDeletionUseCase', () => {
    let useCase: ConfirmDishDeletionUseCase;
    let loggerService: LoggerService;
    let dishWriteService: DishWriteService;

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
    };

    const mockDishWriteService = {
        confirmDeleting: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ConfirmDishDeletionUseCase,
                { provide: LoggerService, useValue: mockLoggerService },
                { provide: DishWriteService, useValue: mockDishWriteService },
            ],
        }).compile();

        useCase = module.get<ConfirmDishDeletionUseCase>(ConfirmDishDeletionUseCase);
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
        const mockUser: UserDto = {
            _id: 'user-1',
            login: 'testUser',
            email: 'test@example.com',
            password: 'hashedPassword',
            capabilities: {
                canAdd: true,
                canEdit: true,
                canDelete: true
            }
        };

        it('should successfully confirm dish deletion', async () => {
            const mockDeletionResult = {
                wasDeleted: true,
                dishTitle: 'Test Dish'
            };
            mockDishWriteService.confirmDeleting.mockResolvedValue(mockDeletionResult);

            const result = await useCase.execute(mockEncodedDishId, mockUser);

            expect(result).toBe(true);
            expect(dishWriteService.confirmDeleting).toHaveBeenCalledWith(mockEncodedDishId);
            expect(loggerService.info).toHaveBeenCalledWith(
                'ConfirmDishDeletionUseCase/execute',
                `Confirmed dish deletion with id "${mockEncodedDishId}" (titled: "${mockDeletionResult.dishTitle}") by "${mockUser.login}" user.`
            );
        });

        it('should return false when dish deletion was not confirmed', async () => {
            const mockDeletionResult = {
                wasDeleted: false,
                dishTitle: 'Test Dish'
            };
            mockDishWriteService.confirmDeleting.mockResolvedValue(mockDeletionResult);

            const result = await useCase.execute(mockEncodedDishId, mockUser);

            expect(result).toBe(false);
            expect(dishWriteService.confirmDeleting).toHaveBeenCalledWith(mockEncodedDishId);
            expect(loggerService.info).toHaveBeenCalledWith(
                'ConfirmDishDeletionUseCase/execute',
                `Confirmed dish deletion with id "${mockEncodedDishId}" (titled: "${mockDeletionResult.dishTitle}") by "${mockUser.login}" user.`
            );
        });

        it('should throw NotFoundException when dish is not found', async () => {
            const error = new DishNotFoundError(mockEncodedDishId);
            mockDishWriteService.confirmDeleting.mockRejectedValue(error);

            await expect(useCase.execute(mockEncodedDishId, mockUser))
                .rejects
                .toThrow(NotFoundException);
            await expect(useCase.execute(mockEncodedDishId, mockUser))
                .rejects
                .toThrow(`Not found dish with ${mockEncodedDishId} id.`);
        });

        it('should throw BadRequestException when dish ID is invalid', async () => {
            const error = new InvalidDishIdError(mockEncodedDishId);
            mockDishWriteService.confirmDeleting.mockRejectedValue(error);

            await expect(useCase.execute(mockEncodedDishId, mockUser))
                .rejects
                .toThrow(BadRequestException);
            await expect(useCase.execute(mockEncodedDishId, mockUser))
                .rejects
                .toThrow(`Invalid "${mockEncodedDishId}" encoded dish id.`);
        });
    });
});