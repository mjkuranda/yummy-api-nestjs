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

describe('MealService', () => {
    let mealService: MealService;
    let mealModel: Model<MealDocument>;

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
                }
            ],
        }).compile();

        mealService = module.get(MealService);
        mealModel = module.get(getModelToken(models.MEAL_MODEL));
    });

    it('should be defined', () => {
        expect(mealService).toBeDefined();
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

            expect(result.statusCode).toBe(201);
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
            jest.spyOn(mealModel, 'findById').mockReturnValueOnce(null);

            await expect(mealService.find(mockId)).rejects.toThrow(NotFoundException);
            expect(mealModel.findById).toHaveBeenCalledWith(mockId);
        });

        it('should find a specific meal', async () => {
            const mockId = '64e9f765d4e60ba693641aa1';
            const mockMeal = {
                _id: mockId,
                name: 'Meal name'
            } as any;
            jest.spyOn(mealModel, 'findById').mockReturnValueOnce(mockMeal);

            const result = await mealService.find(mockId);

            expect(result.data).toBe(mockMeal);
            expect(mealModel.findById).toHaveBeenCalledWith(mockId);
            expect(result.statusCode).toBe(200);
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
            const meals = result.data as MealDocument[];

            expect(result.statusCode).toBe(200);
            expect(meals.length).toBe(mockMeals.length);
        });
    });
});
