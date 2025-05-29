import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../write/dish-write.service';
import { CreateDishUseCase } from './create-dish.use-case';
import { IngredientService } from '../../../ingredient/ingredient.service';
import { CreateDishDto } from '../../dish.dto';
import { DishIngredientWithoutImage } from '../../../ingredient/ingredient.types';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { DishDocument } from '../../../../mongodb/documents/dish.document';
import { DishProvider, DishType, MealType } from '../../../../common/enums';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { Document } from 'mongoose';

describe('CreateDishUseCase', () => {
    let useCase: CreateDishUseCase;
    let loggerService: LoggerService;
    let dishWriteService: DishWriteService;
    let ingredientService: IngredientService;

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
    };

    const mockDishWriteService = {
        saveNewDish: jest.fn(),
    };

    const mockIngredientService = {
        wrapIngredientsWithImages: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateDishUseCase,
                { provide: DishWriteService, useValue: mockDishWriteService },
                { provide: IngredientService, useValue: mockIngredientService },
                { provide: LoggerService, useValue: mockLoggerService },
            ],
        }).compile();

        useCase = module.get<CreateDishUseCase>(CreateDishUseCase);
        loggerService = module.get<LoggerService>(LoggerService);
        dishWriteService = module.get<DishWriteService>(DishWriteService);
        ingredientService = module.get<IngredientService>(IngredientService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
        expect(loggerService).toBeDefined();
        expect(dishWriteService).toBeDefined();
        expect(ingredientService).toBeDefined();
    });

    describe('execute', () => {
        const mockUser: UserAccessTokenPayload = {
            login: 'testUser',
            expirationTimestamp: 987654321,
            capabilities: {
                canAdd: true,
                canEdit: true,
            }
        };

        const mockCreateDishDto = {
            title: 'Test Dish',
            description: 'Test Description',
            ingredients: [{ name: 'ingredient1', amount: 1, unit: 'piece' }],
            language: 'en',
            type: DishType.MAIN_COURSE,
            mealType: MealType.DINNER,
            readyInMinutes: 30,
            imageUrl: 'http://example.com/image.jpg',
            provider: DishProvider.INT_DMT_USER,
            posted: Date.now(),
            get ingredientCount() {
                return this.ingredients.length;
            }
        } as CreateDishDto<DishIngredientWithoutImage>;

        const mockDishDocument = {
            _id: 'dish-123',
            ...mockCreateDishDto,
            author: mockUser.login,
            posted: Date.now(),
            softAdded: true,
            toObject: () => ({}),
        } as unknown as DishDocument & Document;

        const mockWrappedIngredients = [
            { ...mockCreateDishDto.ingredients[0], imageUrl: 'http://example.com/ingredient1.jpg' }
        ];

        it('should successfully create a dish', async () => {
            mockIngredientService.wrapIngredientsWithImages.mockResolvedValue(mockWrappedIngredients);
            mockDishWriteService.saveNewDish.mockResolvedValue(mockDishDocument);

            const result = await useCase.execute(mockCreateDishDto, mockUser);

            expect(result).toBe(mockDishDocument);
            expect(ingredientService.wrapIngredientsWithImages).toHaveBeenCalledWith(mockCreateDishDto.ingredients);
            expect(dishWriteService.saveNewDish).toHaveBeenCalledWith(expect.objectContaining({
                ...mockCreateDishDto,
                ingredients: mockWrappedIngredients,
                author: mockUser.login,
                posted: expect.any(Number),
                provider: DishProvider.INT_DMT_USER,
                softAdded: true,
            }));
            expect(loggerService.info).toHaveBeenCalledWith(
                'CreateDishUseCase/execute',
                `New dish "${mockCreateDishDto.title}", having ${mockCreateDishDto.ingredients.length} ingredients and with "${mockCreateDishDto.imageUrl}" image url has been created by ${mockUser.login}.`
            );
        });

        it('should throw BadRequestException when ingredients list is empty', async () => {
            mockIngredientService.wrapIngredientsWithImages.mockResolvedValue([]);

            await expect(useCase.execute(mockCreateDishDto, mockUser))
                .rejects
                .toThrow(BadRequestException);
            expect(loggerService.error).not.toHaveBeenCalled();
        });

        it('should create dish without image URL', async () => {
            const dtoWithoutImage = {
                ...mockCreateDishDto,
                imageUrl: undefined
            } as CreateDishDto<DishIngredientWithoutImage>;

            mockIngredientService.wrapIngredientsWithImages.mockResolvedValue(mockWrappedIngredients);
            mockDishWriteService.saveNewDish.mockResolvedValue({
                ...mockDishDocument,
                imageUrl: undefined
            } as unknown as DishDocument & Document);

            await useCase.execute(dtoWithoutImage, mockUser);

            expect(loggerService.info).toHaveBeenCalledWith(
                'CreateDishUseCase/execute',
                `New dish "${dtoWithoutImage.title}", having ${dtoWithoutImage.ingredients.length} ingredients and with no image has been created by ${mockUser.login}.`
            );
        });
    });
});