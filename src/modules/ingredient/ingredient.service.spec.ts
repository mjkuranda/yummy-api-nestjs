import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { LoggerService } from '../logger/logger.service';
import { IngredientDocument } from './ingredient.interface';
import { IngredientService } from './ingredient.service';
import { RedisService } from '../redis/redis.service';

describe('IngredientService', () => {
    let ingredientService: IngredientService;
    let ingredientModel: Model<IngredientDocument>;
    let redisService: RedisService;

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
                {
                    provide: LoggerService,
                    useValue: {
                        info: () => {},
                        error: () => {}
                    }
                },
                {
                    provide: RedisService,
                    useValue: {
                        get: jest.fn(),
                        set: jest.fn()
                    }
                }
            ],
        }).compile();

        ingredientService = module.get(IngredientService);
        ingredientModel = module.get(getModelToken(models.INGREDIENT_MODEL));
        redisService = module.get(RedisService);
    });

    it('should be defined', () => {
        expect(ingredientService).toBeDefined();
        expect(ingredientModel).toBeDefined();
        expect(redisService).toBeDefined();
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
        it('should find all ingredients and save to the cache', async () => {
            const mockIngredients = [
                { name: 'Ingredient 1' },
                { name: 'Ingredient 2' }
            ] as any[];
            jest.spyOn(ingredientModel, 'find').mockResolvedValueOnce(mockIngredients);

            const result = await ingredientService.findAll();

            expect(result).toBe(mockIngredients);
            expect(redisService.set).toHaveBeenCalled();
            expect(redisService.set).toHaveBeenCalledWith(mockIngredients, 'ingredients');
        });

        it('should fetch ingredients from cache', async () => {
            const mockCachedIngredients = [
                { name: 'Ingredient 1' },
                { name: 'Ingredient 2' }
            ] as any[];
            jest.spyOn(redisService, 'get').mockReturnValueOnce(Promise.resolve(mockCachedIngredients));

            const result = await ingredientService.findAll();

            expect(result).toBe(mockCachedIngredients);
        });
    });
});
