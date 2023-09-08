import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { LoggerService } from '../logger/logger.service';
import { IngredientDocument } from './ingredient.interface';
import { IngredientService } from './ingredient.service';

describe('IngredientService', () => {
    let ingredientService: IngredientService;
    let ingredientModel: Model<IngredientDocument>;

    const mockIngredientService = {
        create: jest.fn(),
        find: jest.fn(),
        findAll: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IngredientService,
                {
                    provide: getModelToken(models.INGREDIENT_MODEL),
                    useValue: mockIngredientService
                },
                // {
                //     provide: JwtService,
                //     useClass: JwtService
                // },
                // {
                //     provide: JwtManagerService,
                //     useClass: JwtManagerService
                // },
                {
                    provide: LoggerService,
                    useValue: {
                        info: () => {},
                        error: () => {}
                    }
                }
            ],
        }).compile();

        ingredientService = module.get(IngredientService);
        ingredientModel = module.get(getModelToken(models.INGREDIENT_MODEL));
    });

    it('should be defined', () => {
        expect(ingredientService).toBeDefined();
    });

    describe('create', () => {
        let mockIngredientDto;
        let mockIngredient;

        beforeAll(() => {
            mockIngredientDto = {
                name: 'Ingredient name',
                category: 'Category name'
            };
            mockIngredient = {
                _id: '123456789',
                ...mockIngredientDto
            };
        });

        it('should create a new ingredient', async () => {
            jest.spyOn(ingredientModel, 'create').mockResolvedValue(mockIngredient);

            const result = await ingredientService.create(mockIngredientDto);

            expect(result).toBe(mockIngredient);
        });
    });

    describe('findAll', () => {
        it('should find all ingredients', async () => {
            const mockIngredients = [
                { name: 'Ingredient 1' },
                { name: 'Ingredient 2' }
            ] as any[];
            jest.spyOn(ingredientModel, 'find').mockResolvedValue(mockIngredients);

            const result = await ingredientService.findAll();

            expect(result).toBe(mockIngredients);
        });
    });
});
