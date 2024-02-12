import { Test, TestingModule } from '@nestjs/testing';
import * as mongoose from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { LoggerService } from '../logger/logger.service';
import { MealService } from './meal.service';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { RedisService } from '../redis/redis.service';
import { UserDto } from '../user/user.dto';
import { MealRepository } from '../../mongodb/repositories/meal.repository';
import { SpoonacularApiService } from '../api/spoonacular/spoonacular.api.service';
import { IngredientName, MealType } from '../../common/enums';
import { RatedMeal } from './meal.types';

describe('MealService', () => {
    let mealService: MealService;
    let mealRepository: MealRepository;
    let redisService: RedisService;
    let spoonacularApiService: SpoonacularApiService;

    const mockMealService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findById: jest.fn(),
        updateOne: jest.fn(),
        replaceOne: jest.fn(),
        deleteOne: jest.fn()
    };

    const mockSpoonacularApiService = {
        getMeals: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MealService,
                {
                    provide: MealRepository,
                    useValue: mockMealService
                },
                {
                    provide: JwtService,
                    useClass: JwtService
                },
                {
                    provide: JwtManagerService,
                    useClass: JwtManagerService
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
                        set: jest.fn(),
                        unset: jest.fn(),
                        encodeKey: jest.fn(),
                        getMealResult: jest.fn(),
                        saveMealResult: jest.fn()
                    }
                },
                {
                    provide: SpoonacularApiService,
                    useValue: mockSpoonacularApiService
                }
            ],
        }).compile();

        mealService = module.get(MealService);
        mealRepository = module.get(MealRepository);
        redisService = module.get(RedisService);
        spoonacularApiService = module.get(SpoonacularApiService);
    });

    it('should be defined', () => {
        expect(mealService).toBeDefined();
        expect(mealRepository).toBeDefined();
        expect(redisService).toBeDefined();
        expect(spoonacularApiService).toBeDefined();
    });

    describe('create', () => {
        let mockMealDto;
        let mockMeal;

        beforeAll(() => {
            mockMealDto = {
                author: 'Author',
                description: 'Description of the meal',
                ingredients: ['xxx', 'yyy', 'zzz'],
                posted: new Date().getTime(),
                type: 'Meal type'
            };
            mockMeal = {
                ...mockMealDto,
                softAdded: true,
                _id: '123456789'
            };
        });

        it('should create a new meal', async () => {
            jest.spyOn(mealRepository, 'create').mockResolvedValue(mockMeal);

            const result = await mealService.create(mockMealDto);

            expect(result).toBe(mockMeal);
        });
    });

    describe('confirmCreating', () => {
        it('should confirm created meal and save to the cache', async () => {
            const mockId = 'xxx';
            const mockMeal = {
                _id: mockId,
                title: 'XXX',
                description: 'Lorem ipsum',
                author: 'X',
                ingredients: ['x', 'y', 'z'],
                softAdded: true
            } as any;
            const mockAddedMeal = {
                ...mockMeal,
                softAdded: undefined
            } as any;
            const mockUser = {
                _id: 'uuu',
                login: 'user',
                password: 'xxx',
            } as UserDto;

            jest.spyOn(mongoose, 'isValidObjectId')
                .mockReturnValueOnce(true);
            jest.spyOn(mealRepository, 'findById')
                .mockReturnValueOnce(mockMeal)
                .mockReturnValueOnce(mockAddedMeal);

            const result = await mealService.confirmCreating(mockId, mockUser);

            expect(result).toBe(mockAddedMeal);
            expect(redisService.set).toHaveBeenCalled();
            expect(redisService.set).toHaveBeenCalledWith(mockAddedMeal, 'meal');
        });
    });

    describe('edit', () => {
        it('should edit a meal', async () => {
            const mockId = 'xxx';
            const mockMeal = {
                _id: mockId,
                title: 'XXX',
                description: 'Lorem ipsum',
                author: 'X',
                ingredients: ['x', 'y', 'z']
            } as any;
            const editedMealDto = {
                description: 'Lorem ipsum 2',
                author: 'X',
                ingredients: ['x']
            };
            const mockEditedMeal = {
                mockMeal,
                softEdited: editedMealDto
            } as any;

            jest.spyOn(mongoose, 'isValidObjectId')
                .mockReturnValueOnce(true);
            jest.spyOn(mealRepository, 'findById')
                .mockReturnValueOnce(mockMeal)
                .mockReturnValueOnce(mockEditedMeal);

            const result = await mealService.edit(mockId, editedMealDto);

            expect(result).toBe(mockEditedMeal);
        });
    });

    describe('confirmEditing', () => {
        it('should confirm editing meal and update cache', async () => {
            const mockId = 'xxx';
            const mockMeal = {
                _id: mockId,
                title: 'XXX',
                description: 'Lorem ipsum',
                author: 'X',
                ingredients: ['x', 'y', 'z'],
                softEdited: {
                    description: 'Lorem ipsum 2'
                }
            } as any;
            const mockEditedMeal = {
                _id: mockId,
                title: 'XXX',
                description: 'Lorem ipsum 2',
                author: 'X',
                ingredients: ['x', 'y', 'z']
            } as any;
            const mockUser = {
                _id: 'uuu',
                login: 'user',
                password: 'xxx',
            } as UserDto;

            jest.spyOn(mongoose, 'isValidObjectId')
                .mockReturnValueOnce(true);
            jest.spyOn(mealRepository, 'findById')
                .mockReturnValueOnce(mockMeal)
                .mockReturnValueOnce(mockEditedMeal);

            const result = await mealService.confirmEditing(mockId, mockUser);

            expect(result).toStrictEqual(mockEditedMeal);
            expect(redisService.set).toHaveBeenCalled();
            expect(redisService.set).toHaveBeenCalledWith(mockEditedMeal, 'meal');
        });
    });

    describe('delete', () => {
        it('should soft delete a meal and remove from cache', async () => {
            const mockId = 'xxx';
            const mockMeal = {
                _id: mockId,
                title: 'XXX',
                description: 'Lorem ipsum',
                author: 'X',
                ingredients: ['x', 'y', 'z']
            } as any;
            const mockDeletedMeal = {
                ...mockMeal,
                softDeleted: true
            } as any;

            jest.spyOn(mongoose, 'isValidObjectId')
                .mockReturnValueOnce(true);
            jest.spyOn(mealRepository, 'findById')
                .mockReturnValueOnce(mockMeal)
                .mockReturnValueOnce(mockDeletedMeal);

            const result = await mealService.delete(mockId);

            expect(result).toBe(mockDeletedMeal);
            expect(redisService.unset).toHaveBeenCalled();
            expect(redisService.unset).toHaveBeenCalledWith(mockMeal, 'meal');
        });
    });

    describe('confirmDeleting', () => {
        it('should confirm deleting meal', async () => {
            const mockId = 'xxx';
            const mockMeal = {
                _id: mockId,
                title: 'XXX',
                description: 'Lorem ipsum',
                author: 'X',
                ingredients: ['x', 'y', 'z'],
                softDeleted: true
            } as any;
            const mockDeletedMeal = null;
            const mockUser = {
                _id: 'uuu',
                login: 'user',
                password: 'xxx',
            } as UserDto;

            jest.spyOn(mongoose, 'isValidObjectId')
                .mockReturnValueOnce(true);
            jest.spyOn(mealRepository, 'findById')
                .mockReturnValueOnce(mockMeal)
                .mockReturnValueOnce(mockDeletedMeal);

            const result = await mealService.confirmDeleting(mockId, mockUser);

            expect(result).toBe(mockDeletedMeal);
        });
    });

    describe('getMeals', () => {
        it('should return cached query', async () => {
            const ings: IngredientName[] = [IngredientName.CARROT, IngredientName.TOMATO];
            const type: MealType = MealType.SOUP;
            const cachedResult: RatedMeal[] = [
                {
                    id: 'some-id',
                    ingredients: [],
                    relevance: 50,
                    title: 'some-meal'
                }
            ];

            jest.spyOn(redisService, 'getMealResult').mockResolvedValue(cachedResult);

            const result = await mealService.getMeals(ings, type);

            expect(result).toBe(cachedResult);
        });

        it('should build new query from various APIs when cache is empty and save query', async () => {
            const ings: IngredientName[] = [IngredientName.CARROT, IngredientName.TOMATO];
            const type: MealType = MealType.SOUP;
            const cachedResult = null;
            const mockResult: RatedMeal[] = [
                {
                    id: 'some-id',
                    ingredients: [],
                    relevance: 50,
                    title: 'some-meal'
                }
            ];

            jest.spyOn(redisService, 'getMealResult').mockResolvedValue(cachedResult);
            jest.spyOn(spoonacularApiService, 'getMeals').mockResolvedValue(mockResult);
            jest.spyOn(redisService, 'saveMealResult').mockResolvedValue();

            const result = await mealService.getMeals(ings, type);

            expect(result).toStrictEqual(mockResult);
            expect(redisService.saveMealResult).toHaveBeenCalled();
        });
    });

    describe('find', () => {
        it('should throw an error when provided invalid MongoDB id', async () => {
            const mockInvalidId = 'invalid id';
            const mockIsValidObjectId = jest.spyOn(mongoose, 'isValidObjectId').mockReturnValueOnce(false);

            await expect(mealService.find(mockInvalidId)).rejects.toThrow(BadRequestException);
            expect(mockIsValidObjectId).toHaveBeenCalledWith(mockInvalidId);
        });

        it('should throw an error when meal with provided id not found', async () => {
            const mockId = '64e9f765d4e60ba693641aa1';
            const mockFilter = {
                _id: mockId,
                softAdded: { $exists: false },
                softDeleted: { $exists: false }
            };
            const mockCachedMeal = null;
            jest.spyOn(redisService, 'get').mockReturnValueOnce(mockCachedMeal);
            jest.spyOn(mealRepository, 'findOne').mockReturnValueOnce(null);

            await expect(mealService.find(mockId)).rejects.toThrow(NotFoundException);
            expect(redisService.get).toHaveBeenCalled();
            expect(redisService.get).toReturnWith(mockCachedMeal);
            expect(mealRepository.findOne).toHaveBeenCalledWith(mockFilter);
        });

        it('should find a specific meal when cache is empty and save to the cache', async () => {
            const mockId = '64e9f765d4e60ba693641aa1';
            const mockCachedMeal = null;
            const mockMeal = {
                _id: mockId,
                name: 'Meal name'
            } as any;
            const mockFilter = {
                _id: mockId,
                softAdded: { $exists: false },
                softDeleted: { $exists: false }
            };
            jest.spyOn(redisService, 'get').mockReturnValueOnce(mockCachedMeal);
            jest.spyOn(mealRepository, 'findOne').mockReturnValueOnce(mockMeal);

            const result = await mealService.find(mockId);

            expect(result).toBe(mockMeal);
            expect(redisService.get).toHaveBeenCalled();
            expect(redisService.get).toReturnWith(mockCachedMeal);
            expect(mealRepository.findOne).toHaveBeenCalledWith(mockFilter);
            expect(redisService.set).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should find all meals', async () => {
            const mockMeals = [
                { name: 'Meal 1' },
                { name: 'Meal 2' }
            ] as any[];
            jest.spyOn(mealRepository, 'findAll').mockResolvedValue(mockMeals);

            const result = await mealService.findAll();

            expect(result).toBe(mockMeals);
        });
    });
});
