import { Test, TestingModule } from '@nestjs/testing';
import { TestApiService } from './test.api.service';
import { RedisService } from '../modules/redis/redis.service';
import { LoggerService } from '../modules/logger/logger.service';
import { AxiosService } from './axios.service';
import { MealType, IngredientName, DishType } from '../common/enums';
import { RatedDish } from '../modules/dish/dish.types';

describe('TestApiService', () => {
    let testApiService: TestApiService;
    let axiosService: AxiosService;
    let redisService: RedisService;

    const axiosServiceProvider = {
        get: jest.fn()
    };

    const redisServiceProvider = {
        getDishResult: jest.fn(),
        saveDishResult: jest.fn()
    };

    const loggerServiceProvider = {
        info: jest.fn(),
        error: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TestApiService,
                { provide: AxiosService, useValue: axiosServiceProvider },
                { provide: RedisService, useValue: redisServiceProvider },
                { provide: LoggerService, useValue: loggerServiceProvider }
            ]
        }).compile();

        testApiService = module.get<TestApiService>(TestApiService);
        axiosService = module.get<AxiosService>(AxiosService);
        redisService = module.get<RedisService>(RedisService);
    });

    it('should be defined', () => {
        expect(testApiService).toBeDefined();
        expect(redisService).toBeDefined();
    });

    describe('getDishes', () => {
        const ingredients = [IngredientName.CARROT, IngredientName.TOMATO];
        const mealType = MealType.LAUNCH;
        const mockResult: RatedDish[] = [
            {
                id: 'some-id',
                ingredients: [],
                missingCount: 1,
                relevance: 50,
                title: 'some-dish',
                provider: 'yummy',
                type: DishType.ANY,
                mealType: MealType.ANY
            }
        ];

        it('should return cached result when query is still in cache', async () => {
            jest.spyOn(redisService, 'getDishResult').mockResolvedValueOnce(mockResult);

            const result = await testApiService.getDishes(ingredients, mealType);

            expect(result).toStrictEqual(mockResult);
        });

        it('should return empty array when cache is empty and external API returned error', async () => {
            const mockResult = [];

            jest.spyOn(redisService, 'getDishResult').mockResolvedValueOnce(null);
            jest.spyOn(axiosService, 'get').mockResolvedValueOnce({ status: 400 });

            const result = await testApiService.getDishes(ingredients, mealType);

            expect(result).toStrictEqual(mockResult);
            expect(redisService.getDishResult).toHaveBeenCalled();
            expect(axiosService.get).toHaveBeenCalled();
        });

        it('should return external API result when there is no cached result and save to cache', async () => {
            jest.spyOn(redisService, 'getDishResult').mockResolvedValueOnce(null);
            jest.spyOn(axiosService, 'get').mockResolvedValueOnce({
                status: 200,
                data: mockResult
            });

            const result = await testApiService.getDishes(ingredients, mealType);

            expect(result).toStrictEqual(mockResult);
            expect(redisService.saveDishResult).toHaveBeenCalled();
        });
    });

    describe('getDishDetails', () => {
        it('should return a dish when everything went fine', async () => {
            const mockDishFromExternalAPI = {
                id: 'id',
                title: 'some title'
            };
            const mockInstructionFromExternalAPI = [ 1 ];

            jest.spyOn(axiosService, 'get').mockResolvedValueOnce({
                status: 200,
                data: mockDishFromExternalAPI
            });
            jest.spyOn(axiosService, 'get').mockResolvedValueOnce({
                status: 200,
                data: mockInstructionFromExternalAPI
            });

            const result = await testApiService.getDishDetails(mockDishFromExternalAPI.id);

            expect(result).toStrictEqual({ ...mockDishFromExternalAPI, ...mockInstructionFromExternalAPI });
        });

        it('shouldn\'t return any dish when there is no such dish with provided id', async () => {
            jest.spyOn(axiosService, 'get').mockResolvedValueOnce({
                status: 404,
                data: null
            });

            const result = await testApiService.getDishDetails('123');

            expect(result).toStrictEqual(null);
        });
    });
});