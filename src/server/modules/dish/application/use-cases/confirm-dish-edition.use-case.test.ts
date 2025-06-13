import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../domain/write/dish-write.service';
import { ConfirmDishEditionUseCase } from './confirm-dish-edition.use-case';
import { DishNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { DishDocument } from '../../../../mongodb/documents/dish.document';
import { UserDto } from '../../../user/user.dto';
import { Document } from 'mongoose';

describe('ConfirmDishEditionUseCase', () => {
    let useCase: ConfirmDishEditionUseCase;
    let loggerService: LoggerService;
    let dishWriteService: DishWriteService;

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
    };

    const mockDishWriteService = {
        confirmEditing: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ConfirmDishEditionUseCase,
                { provide: LoggerService, useValue: mockLoggerService },
                { provide: DishWriteService, useValue: mockDishWriteService },
            ],
        }).compile();

        useCase = module.get<ConfirmDishEditionUseCase>(ConfirmDishEditionUseCase);
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
            _id: '123-456',
            login: 'testUser',
            email: 'abc@abc.com',
            password: 'abcqwert',
            capabilities: {
                canAdd: true,
                canEdit: true,
                canDelete: true
            }
        };
        const mockDishDocument = {
            title: 'Test Dish',
        } as DishDocument & Document;

        it('should successfully confirm dish edition', async () => {
            mockDishWriteService.confirmEditing.mockResolvedValue(mockDishDocument);

            const result = await useCase.execute(mockEncodedDishId, mockUser);

            expect(result).toEqual(mockDishDocument);
            expect(dishWriteService.confirmEditing).toHaveBeenCalledWith(mockEncodedDishId);
            expect(loggerService.info).toHaveBeenCalledWith(
                'ConfirmDishEditionUseCase/execute',
                `Dish edition for "${mockEncodedDishId}" (titled: "${mockDishDocument.title}") has been confirmed by "${mockUser.login}" user.`
            );
        });

        it('should throw NotFoundException when dish is not found', async () => {
            const error = new DishNotFoundError(mockEncodedDishId);
            mockDishWriteService.confirmEditing.mockRejectedValue(error);

            await expect(useCase.execute(mockEncodedDishId, mockUser))
                .rejects
                .toThrow(NotFoundException);
            await expect(useCase.execute(mockEncodedDishId, mockUser))
                .rejects
                .toThrow(`Dish "${mockEncodedDishId}" not found`);
        });

        it('should throw BadRequestException when dish ID is invalid', async () => {
            const error = new InvalidDishIdError(mockEncodedDishId);
            mockDishWriteService.confirmEditing.mockRejectedValue(error);

            await expect(useCase.execute(mockEncodedDishId, mockUser))
                .rejects
                .toThrow(BadRequestException);
            await expect(useCase.execute(mockEncodedDishId, mockUser))
                .rejects
                .toThrow(`Invalid dish ID "${mockEncodedDishId}"`);
        });
    });
});