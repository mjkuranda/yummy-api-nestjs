import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { LoggerService } from '../logger/logger.service';
import { MealService } from './meal.service';
import { MealDocument } from './meal.interface';

describe('MealService', () => {
    let mealService: MealService;
    let mealModel: Model<MealDocument>;

    const mockMealService = {
        create: jest.fn()
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
});
