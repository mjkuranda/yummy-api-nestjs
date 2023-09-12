import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { LoggerService } from '../logger/logger.service';
import { MealService } from './meal.service';
import { MealDocument } from './meal.interface';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { RedisService } from '../redis/redis.service';

describe('MealService', () => {
    let mealService: MealService;
    let mealModel: Model<MealDocument>;
    let redisService: RedisService;

    const mockMealService = {
        create: jest.fn(),
        find: jest.fn(),
        findById: jest.fn()
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

        it('should create a new meal and save to cache', async () => {
            jest.spyOn(mealModel, 'create').mockResolvedValue(mockMeal);

            const result = await mealService.create(mockMealDto);

            expect(result).toBe(mockMeal);
            expect(redisService.set).toHaveBeenCalled();
            expect(redisService.set).toHaveBeenCalledWith(mockMeal, 'meal');
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
            jest.spyOn(redisService, 'get').mockReturnValueOnce(null);
            jest.spyOn(mealModel, 'findById').mockReturnValueOnce(null);

            await expect(mealService.find(mockId)).rejects.toThrow(NotFoundException);
            expect(mealModel.findById).toHaveBeenCalledWith(mockId);
        });

        it('should find a specific meal when cache is empty', async () => {
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
