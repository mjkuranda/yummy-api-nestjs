import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../domain/write/dish-write.service';
import { ConfirmDishCreationUseCase } from './confirm-dish-creation.use-case';
import { UserDto } from '../../../user/user.dto';
import { DishNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { NotFoundException, BadRequestException } from '../../../../exceptions';

describe('ConfirmDishCreationUseCase', () => {
    let useCase: ConfirmDishCreationUseCase;
    let loggerService: LoggerService;
    let dishWriteService: DishWriteService;

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
    };

    const mockDishWriteService = {
        confirmCreating: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ConfirmDishCreationUseCase,
                { provide: LoggerService, useValue: mockLoggerService },
                { provide: DishWriteService, useValue: mockDishWriteService },
            ],
        }).compile();

        useCase = module.get<ConfirmDishCreationUseCase>(ConfirmDishCreationUseCase);
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
        const mockDishDetails = {
            title: 'Test Dish',
        };

        it('should successfully confirm dish creation', async () => {
            mockDishWriteService.confirmCreating.mockResolvedValue(mockDishDetails);

            await useCase.execute(mockEncodedDishId, mockUser);

            expect(dishWriteService.confirmCreating).toHaveBeenCalledWith(mockEncodedDishId);
            expect(loggerService.info).toHaveBeenCalledWith(
                'ConfirmDishCreationUseCase/execute',
                `Dish with id "${mockEncodedDishId}" (titled: "${mockDishDetails.title}") has been confirmed by "${mockUser.login}" user and cached.`
            );
        });

        it('should throw NotFoundException when dish is not found', async () => {
            const error = new DishNotFoundError(mockEncodedDishId);
            mockDishWriteService.confirmCreating.mockRejectedValue(error);

            await expect(useCase.execute(mockEncodedDishId, mockUser))
                .rejects
                .toThrow(NotFoundException);
            await expect(useCase.execute(mockEncodedDishId, mockUser))
                .rejects
                .toThrow(`Not found dish with ${mockEncodedDishId} id`);
        });

        it('should throw BadRequestException when dish ID is invalid', async () => {
            const error = new InvalidDishIdError(mockEncodedDishId);
            mockDishWriteService.confirmCreating.mockRejectedValue(error);

            await expect(useCase.execute(mockEncodedDishId, mockUser))
                .rejects
                .toThrow(BadRequestException);
            await expect(useCase.execute(mockEncodedDishId, mockUser))
                .rejects
                .toThrow(`Invalid "${mockEncodedDishId}" encoded dish id.`);
        });
    });
});