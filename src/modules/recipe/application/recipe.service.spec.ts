import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../logger/logger.service';
import { RecipeService } from './recipe.service';
import { DishRepository } from '../../../mongodb/repositories/dish.repository';
import { CreateRecipeDto } from '../recipe.dto';
import { NotFoundException } from '../../../exceptions/not-found.exception';
import { ForbiddenException } from '../../../exceptions/forbidden-exception';
import { BadRequestException } from '../../../exceptions/bad-request.exception';
import { DishRecipeRepository } from '../../../mongodb/repositories/dish-recipe.repository';
import mongoose from 'mongoose';
import { ExternalApiService } from '../../api/external-api.service';
import { RedisService } from '../../redis/redis.service';

describe('RecipeService', () => {
    let externalApiService: ExternalApiService;
    let recipeService: RecipeService;
    let recipeRepository: DishRecipeRepository;
    let dishRepository: DishRepository;
    let redisService: RedisService;

    const mockExternalApiService = {
        getDishDetails: jest.fn(),
        getDishRecipe: jest.fn()
    };

    const mockRecipeRepository = {
        findByDishId: jest.fn(),
        create: jest.fn()
    };

    const mockDishRepository = {
        findById: jest.fn()
    };

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn()
    };

    const mockRedisService = {
        getDishDetails: jest.fn(),
        getDishRecipe: jest.fn(),
        saveDishRecipe: jest.fn(),
        saveDishDetails: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RecipeService,
                { provide: ExternalApiService, useValue: mockExternalApiService },
                { provide: DishRecipeRepository, useValue: mockRecipeRepository },
                { provide: DishRepository, useValue: mockDishRepository },
                { provide: LoggerService, useValue: mockLoggerService },
                { provide: RedisService, useValue: mockRedisService }
            ],
        }).compile();

        externalApiService = module.get(ExternalApiService);
        recipeService = module.get(RecipeService);
        recipeRepository = module.get(DishRecipeRepository);
        dishRepository = module.get(DishRepository);
        redisService = module.get(RedisService);
    });

    it('should be defined', () => {
        expect(externalApiService).toBeDefined();
        expect(recipeService).toBeDefined();
        expect(recipeRepository).toBeDefined();
        expect(dishRepository).toBeDefined();
        expect(redisService).toBeDefined();
    });

    describe('create', () => {
        let mockDishId;
        let mockCreateRecipeDto;
        let mockAdminUser;
        let mockUser;
        let mockDish;
        let mockDishUser123;
        let mockExistingRecipe;

        beforeAll(() => {
            mockDishId = 'd-123';

            mockCreateRecipeDto = {
                dishId: mockDishId,
                language: 'en',
                sections: []
            } as CreateRecipeDto;

            mockAdminUser = {
                login: 'user456',
                isAdmin: true
            } as any;


            mockUser = {
                login: 'user123'
            } as any;

            mockDish = {} as any;

            mockDishUser123 = {
                author: mockUser.login
            } as any;

            mockExistingRecipe = {} as any;
        });

        it('should fail when dish does not exist', async () => {
            const mockDishId = 'abc-123';

            jest.spyOn(dishRepository, 'findById').mockResolvedValueOnce(null);

            await expect(recipeService.create(mockDishId, mockCreateRecipeDto, mockUser)).rejects.toThrow(NotFoundException);
        });

        it('should fail when user has not sufficient permission', async () => {
            const mockDishId = 'd-123';

            jest.spyOn(dishRepository, 'findById').mockResolvedValueOnce(mockDish);

            await expect(recipeService.create(mockDishId, mockCreateRecipeDto, mockUser)).rejects.toThrow(ForbiddenException);
        });

        it('should fail when recipe already exists', async () => {
            const mockDishId = 'd-123';

            jest.spyOn(dishRepository, 'findById').mockResolvedValueOnce(mockDishUser123);
            jest.spyOn(recipeRepository, 'findByDishId').mockResolvedValueOnce(mockExistingRecipe);

            await expect(recipeService.create(mockDishId, mockCreateRecipeDto, mockUser)).rejects.toThrow(BadRequestException);
        });

        it('should pass and add a new recipe', async () => {
            const mockDishId = 'd-123';

            jest.spyOn(dishRepository, 'findById').mockResolvedValueOnce(mockDishUser123);
            jest.spyOn(recipeRepository, 'findByDishId').mockResolvedValueOnce(null);
            jest.spyOn(recipeRepository, 'create').mockResolvedValueOnce(mockExistingRecipe);

            const recipe = await recipeService.create(mockDishId, mockCreateRecipeDto, mockUser);

            expect(recipe).toBeDefined();
            expect(dishRepository.findById).toHaveBeenCalledWith(mockDishId);
            expect(recipeRepository.findByDishId).toHaveBeenCalledWith(mockDishId);
            expect(recipeRepository.create).toHaveBeenCalledWith(mockCreateRecipeDto);
        });

        it('should pass when admin adds missing recipe', async () => {
            const mockDishId = 'd-123';

            jest.spyOn(dishRepository, 'findById').mockResolvedValueOnce(mockDishUser123);
            jest.spyOn(recipeRepository, 'findByDishId').mockResolvedValueOnce(null);
            jest.spyOn(recipeRepository, 'create').mockResolvedValueOnce(mockExistingRecipe);

            const recipe = await recipeService.create(mockDishId, mockCreateRecipeDto, mockAdminUser);

            expect(recipe).toBeDefined();
            expect(dishRepository.findById).toHaveBeenCalledWith(mockDishId);
            expect(recipeRepository.findByDishId).toHaveBeenCalledWith(mockDishId);
            expect(recipeRepository.create).toHaveBeenCalledWith(mockCreateRecipeDto);
        });
    });

    describe('get', () => {
        let mockDishId, mockDish, mockRecipe;

        beforeAll(() => {
            mockDishId = 'abc-123';
            mockDish = {} as any;
            mockRecipe = {
                sections: [{}]
            } as any;
        });

        it('should pass when recipe found in cache', async () => {
            jest.spyOn(redisService, 'getDishRecipe').mockResolvedValueOnce(mockRecipe);

            const recipe = await recipeService.get(mockDishId);

            expect(recipe).toBeDefined();
        });

        it('should fail when dish does not exist', async () => {
            jest.spyOn(redisService, 'getDishRecipe').mockResolvedValueOnce(null);
            jest.spyOn(mongoose, 'isValidObjectId').mockReturnValueOnce(true);
            jest.spyOn(dishRepository, 'findById').mockResolvedValueOnce(null);

            await expect(recipeService.get(mockDishId)).rejects.toThrow(BadRequestException);
        });

        it('should fail when no recipe assigned to the dish', async () => {
            jest.spyOn(redisService, 'getDishRecipe').mockResolvedValueOnce(null);
            jest.spyOn(mongoose, 'isValidObjectId').mockReturnValueOnce(true);
            jest.spyOn(dishRepository, 'findById').mockResolvedValueOnce(mockDish);
            jest.spyOn(recipeRepository, 'findByDishId').mockResolvedValueOnce(null);

            await expect(recipeService.get(mockDishId)).rejects.toThrow(NotFoundException);
        });

        it('should return a recipe for a specific dish when dish and recipe exist', async () => {
            jest.spyOn(redisService, 'getDishRecipe').mockResolvedValueOnce(null);
            jest.spyOn(mongoose, 'isValidObjectId').mockReturnValueOnce(true);
            jest.spyOn(redisService, 'getDishDetails').mockResolvedValueOnce(null);
            jest.spyOn(dishRepository, 'findById').mockResolvedValueOnce(mockDish);
            jest.spyOn(recipeRepository, 'findByDishId').mockResolvedValueOnce(mockRecipe);

            const { recipe } = await recipeService.get(mockDishId);

            expect(recipe).toBeDefined();
            expect(recipe.sections).toBeDefined();
            expect(recipe.sections.length).toBeGreaterThanOrEqual(1);
            expect(redisService.saveDishDetails).toHaveBeenCalledWith(mockDishId, mockDish);
        });
    });
});