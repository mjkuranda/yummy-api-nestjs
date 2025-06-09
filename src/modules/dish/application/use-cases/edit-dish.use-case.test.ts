import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../write/dish-write.service';
import { EditDishUseCase } from './edit-dish.use-case';
import { DishEditDto } from '../../dish.dto';
import { DishIngredient } from '../../../ingredient/ingredient.types';
import { DishNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { DishDocument } from '../../../../mongodb/documents/dish.document';
import { Document } from 'mongoose';
import { DishType, MealType, Provider } from '../../../../common/enums';
import { UserDto } from '../../../user/user.dto';

describe('EditDishUseCase', () => {
    let useCase: EditDishUseCase;
    let loggerService: LoggerService;
    let dishWriteService: DishWriteService;

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
    };

    const mockDishWriteService = {
        editDish: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EditDishUseCase,
                { provide: LoggerService, useValue: mockLoggerService },
                { provide: DishWriteService, useValue: mockDishWriteService },
            ],
        }).compile();

        useCase = module.get<EditDishUseCase>(EditDishUseCase);
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
        const mockEncodedDishId: EncodedComplexDishId = 'encoded-dish-123';
        const mockEditDishDto: DishEditDto<DishIngredient> = {
            title: 'Updated Test Dish',
            description: 'Updated test description',
            ingredients: [],
            type: DishType.MAIN_COURSE,
            mealType: MealType.DINNER,
            readyInMinutes: 45,
            imageUrl: 'http://example.com/updated-dish.jpg',
        };
        const mockDishDocument = {
            _id: 'dish-1',
            title: 'Updated Test Dish',
            description: 'Updated test description',
            ingredients: [],
            language: 'en',
            type: DishType.MAIN_COURSE,
            mealType: MealType.DINNER,
            readyInMinutes: 45,
            imageUrl: 'http://example.com/updated-dish.jpg',
            author: mockUser.login,
            provider: Provider.INT_DMT_USER,
            posted: Date.now(),
            softEdited: true,
        } as unknown as (DishDocument & Document);

        it('should successfully edit a dish', async () => {
            mockDishWriteService.editDish.mockResolvedValue({ dishTitle: mockDishDocument.title });

            await useCase.execute(mockEncodedDishId, mockEditDishDto);

            expect(dishWriteService.editDish).toHaveBeenCalledWith(mockEncodedDishId, mockEditDishDto);
            expect(loggerService.info).toHaveBeenCalledWith(
                'EditDishUseCase/execute',
                `Dish with id "${mockEncodedDishId}" (titled: "${mockDishDocument.title}") has been edited.`
            );
        });

        it('should throw NotFoundException when dish is not found', async () => {
            const error = new DishNotFoundError(mockEncodedDishId);
            mockDishWriteService.editDish.mockRejectedValue(error);

            await expect(useCase.execute(mockEncodedDishId, mockEditDishDto))
                .rejects
                .toThrow(NotFoundException);
            await expect(useCase.execute(mockEncodedDishId, mockEditDishDto))
                .rejects
                .toThrow(`Not found dish with ${mockEncodedDishId} id.`);
        });

        it('should throw BadRequestException when dish ID is invalid', async () => {
            const error = new InvalidDishIdError(mockEncodedDishId);
            mockDishWriteService.editDish.mockRejectedValue(error);

            await expect(useCase.execute(mockEncodedDishId, mockEditDishDto))
                .rejects
                .toThrow(BadRequestException);
            await expect(useCase.execute(mockEncodedDishId, mockEditDishDto))
                .rejects
                .toThrow(`Invalid "${mockEncodedDishId}" encoded dish id.`);
        });
    });
});