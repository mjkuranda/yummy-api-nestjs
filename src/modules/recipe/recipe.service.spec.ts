import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../logger/logger.service';
import { RecipeService } from './recipe.service';
import { DishRepository } from '../../mongodb/repositories/dish.repository';
import { CreateRecipeDto } from './recipe.dto';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { ForbiddenException } from '../../exceptions/forbidden-exception';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { RecipeRepository } from '../../mongodb/repositories/recipe.repository';

describe('RecipeService', () => {
    let recipeService: RecipeService;
    let recipeRepository: RecipeRepository;
    let dishRepository: DishRepository;

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

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RecipeService,
                { provide: RecipeRepository, useValue: mockRecipeRepository },
                { provide: DishRepository, useValue: mockDishRepository },
                { provide: LoggerService, useValue: mockLoggerService }
            ],
        }).compile();

        recipeService = module.get(RecipeService);
        recipeRepository = module.get(RecipeRepository);
        dishRepository = module.get(DishRepository);
    });

    it('should be defined', () => {
        expect(recipeService).toBeDefined();
        expect(recipeRepository).toBeDefined();
        expect(dishRepository).toBeDefined();
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

        it('should fail when dish does not exist', async () => {
            jest.spyOn(dishRepository, 'findById').mockResolvedValueOnce(null);

            await expect(recipeService.get(mockDishId)).rejects.toThrow(BadRequestException);
        });

        it('should fail when is not recipe assigned to the dish', async () => {
            jest.spyOn(dishRepository, 'findById').mockResolvedValueOnce(mockDish);
            jest.spyOn(recipeRepository, 'findByDishId').mockResolvedValueOnce(null);

            await expect(recipeService.get(mockDishId)).rejects.toThrow(NotFoundException);
        });

        it('should return a recipe for a specific dish when dish and recipe exist', async () => {
            jest.spyOn(dishRepository, 'findById').mockResolvedValueOnce(mockDish);
            jest.spyOn(recipeRepository, 'findByDishId').mockResolvedValueOnce(mockRecipe);

            const recipe = await recipeService.get(mockDishId);

            expect(recipe).toBeDefined();
            expect(recipe.sections).toBeDefined();
            expect(recipe.sections.length).toBeGreaterThanOrEqual(1);
        });
    });
});