import { Test, TestingModule } from '@nestjs/testing';
import { TestApiService } from './test.api.service';
import { RedisService } from '../modules/redis/redis.service';
import { LoggerService } from '../modules/logger/logger.service';
import { AxiosService } from './axios.service';
import { IngredientName, MealType } from '../common/enums';
import { RatedMeal } from '../modules/meal/meal.types';

describe('TestApiService', () => {
    let testApiService: TestApiService;
    let axiosService: AxiosService;
    let redisService: RedisService;

    const axiosServiceProvider = {
        get: jest.fn()
    };

    const redisServiceProvider = {
        getMealResult: jest.fn(),
        saveMealResult: jest.fn()
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

    describe('getMeals', () => {
        const apiKey = null;
        const endpointUrl = '';
        const ingredients = [IngredientName.CARROT, IngredientName.TOMATO];
        const mealType = MealType.SOUP;
        const mockResult: RatedMeal[] = [
            {
                id: 'some-id',
                ingredients: [],
                relevance: 50,
                title: 'some-meal'
            }
        ];

        it('should return cached result when query is still in cache', async () => {
            jest.spyOn(redisService, 'getMealResult').mockResolvedValueOnce(mockResult);

            const result = await testApiService.getMeals(apiKey, endpointUrl, ingredients, mealType);

            expect(result).toStrictEqual(mockResult);
        });

        it('should return empty array when cache is empty and external API returned error', async () => {
            const mockResult = [];

            jest.spyOn(redisService, 'getMealResult').mockResolvedValueOnce(null);
            jest.spyOn(axiosService, 'get').mockResolvedValueOnce({ status: 400 });

            const result = await testApiService.getMeals(apiKey, endpointUrl, ingredients, mealType);

            expect(result).toStrictEqual(mockResult);
            expect(redisService.getMealResult).toHaveBeenCalled();
            expect(axiosService.get).toHaveBeenCalled();
        });

        it('should return external API result when there is no cached result and save to cache', async () => {
            jest.spyOn(redisService, 'getMealResult').mockResolvedValueOnce(null);
            jest.spyOn(axiosService, 'get').mockResolvedValueOnce({
                status: 200,
                data: mockResult
            });

            const result = await testApiService.getMeals(apiKey, endpointUrl, ingredients, mealType);

            expect(result).toStrictEqual(mockResult);
            expect(redisService.saveMealResult).toHaveBeenCalled();
        });
    });

    describe('getMealDetails', () => {
        it('should return a meal when everything went fine', async () => {
            const mockMealFromExternalAPI = {
                id: 'id',
                title: 'some title'
            };
            const mockId = 'id';

            jest.spyOn(axiosService, 'get').mockResolvedValueOnce({
                status: 200,
                data: mockMealFromExternalAPI
            });

            const result = await testApiService.getMealDetails(mockId);

            expect(result).toStrictEqual(mockMealFromExternalAPI);
        });

        it('shouldn\'t return any meal when there is no such meal with provided id', async () => {
            const mockId = 'id';

            jest.spyOn(axiosService, 'get').mockResolvedValueOnce({
                status: 404,
                data: null
            });

            const result = await testApiService.getMealDetails(mockId);

            expect(result).toStrictEqual(null);
        });
    });
});