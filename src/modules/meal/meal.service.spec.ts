import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { isValidObjectId, Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { LoggerService } from '../logger/logger.service';
import { MealService } from './meal.service';
import { MealDocument } from './meal.interface';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { RedisService } from '../redis/redis.service';
import { UserDto } from '../user/user.dto';

describe('MealService', () => {
    let mealService: MealService;
    let mealModel: Model<MealDocument>;
    let redisService: RedisService;

    const mockMealService = {
        create: jest.fn(),
        find: jest.fn(),
        findById: jest.fn(),
        updateOne: jest.fn(),
        replaceOne: jest.fn(),
        deleteOne: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MealService,
                {
                    provide: getModelToken(models.MEAL_MODEL),
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
                        encodeKey: jest.fn()
                    }
                }
            ],
        }).compile();

        mealService = module.get(MealService);
        mealModel = module.get(getModelToken(models.MEAL_MODEL));
        redisService = module.get(RedisService);
    });

    it('should be defined', () => {
        expect(mealService).toBeDefined();
        expect(mealModel).toBeDefined();
        expect(redisService).toBeDefined();
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
                _id: '123456789'
            };
        });

        it('should create a new meal', async () => {
            jest.spyOn(mealModel, 'create').mockResolvedValue(mockMeal);

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
            jest.spyOn(mealModel, 'findById')
                .mockReturnValueOnce(mockMeal)
                .mockReturnValueOnce(mockAddedMeal);

            const result = await mealService.confirmCreating(mockId, mockUser);

            expect(result).toBe(mockAddedMeal);
            expect(redisService.set).toHaveBeenCalled();
            expect(redisService.set).toHaveBeenCalledWith(mockAddedMeal, 'meal');
        });
    });

    describe('edit', () => {
        it('should confirm editing meal', async () => {
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
                _id: mockId,
                title: 'XXX',
                ...editedMealDto
            } as any;

            jest.spyOn(mongoose, 'isValidObjectId')
                .mockReturnValueOnce(true);
            jest.spyOn(mealModel, 'findById')
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
                    _id: mockId,
                    title: 'XXX',
                    description: 'Lorem ipsum 2',
                    author: 'X',
                    ingredients: ['x']
                }
            } as any;
            const mockEditedMeal = {
                ...mockMeal.softEdited
            } as any;
            const mockUser = {
                _id: 'uuu',
                login: 'user',
                password: 'xxx',
            } as UserDto;

            jest.spyOn(mongoose, 'isValidObjectId')
                .mockReturnValueOnce(true);
            jest.spyOn(mealModel, 'findById')
                .mockReturnValueOnce(mockMeal)
                .mockReturnValueOnce(mockEditedMeal);

            const result = await mealService.confirmEditing(mockId, mockUser);

            expect(result).toBe(mockEditedMeal);
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
            jest.spyOn(mealModel, 'findById')
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
            jest.spyOn(mealModel, 'findById')
                .mockReturnValueOnce(mockMeal)
                .mockReturnValueOnce(mockDeletedMeal);

            const result = await mealService.confirmDeleting(mockId, mockUser);

            expect(result).toBe(mockDeletedMeal);
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
            const mockCachedMeal = null;
            jest.spyOn(redisService, 'get').mockReturnValueOnce(mockCachedMeal);
            jest.spyOn(mealModel, 'findById').mockReturnValueOnce(null);

            await expect(mealService.find(mockId)).rejects.toThrow(NotFoundException);
            expect(redisService.get).toHaveBeenCalled();
            expect(redisService.get).toReturnWith(mockCachedMeal);
            expect(mealModel.findById).toHaveBeenCalledWith(mockId);
        });

        it('should find a specific meal when cache is empty and save to the cache', async () => {
            const mockId = '64e9f765d4e60ba693641aa1';
            const mockCachedMeal = null;
            const mockMeal = {
                _id: mockId,
                name: 'Meal name'
            } as any;
            jest.spyOn(redisService, 'get').mockReturnValueOnce(mockCachedMeal);
            jest.spyOn(mealModel, 'findById').mockReturnValueOnce(mockMeal);

            const result = await mealService.find(mockId);

            expect(result).toBe(mockMeal);
            expect(redisService.get).toHaveBeenCalled();
            expect(redisService.get).toReturnWith(mockCachedMeal);
            expect(mealModel.findById).toHaveBeenCalledWith(mockId);
            expect(redisService.set).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should find all meals', async () => {
            const mockMeals = [
                { name: 'Meal 1' },
                { name: 'Meal 2' }
            ] as any[];
            jest.spyOn(mealModel, 'find').mockResolvedValue(mockMeals);

            const result = await mealService.findAll();

            expect(result).toBe(mockMeals);
        });
    });
});
