import { Test } from '@nestjs/testing';
import { DishReadService } from '../dish-read.service';
import {
    mockProviderRegistryService,
    mockDishCacheService,
    mockDishAggregatorService,
    mockDishApiService,
    mockUserApiService,
    mockProvidable
} from '../__mocks__/dish-read-services.mock';
import {
    encodedDishIdVoFixture,
    dishResultVoFixture,
    dishResultVoFixture2,
    dishDetailsVoFixture,
    softAddedDishDetailsVoFixture,
    softDeletedDishDetailsVoFixture,
    dishEntityFixture,
    dishCommentVoFixture,
    dishCommentVoFixture2,
    userSearchQueryEntitiesFixture,
    providedIngredientsFixture,
    mergedIngredientsFixture,
    mealTypeFixture,
    userLoginFixture
} from '../__fixtures__/dish-read.service.fixture';
import { DishNotFoundError, DishNotAcceptedError, DishSoftDeletedError } from '../../../errors';
import { ProviderRegistryService } from '../../../../../provider-registry/provider-registry.service';
import { DishCacheService } from '../../../../../cache/domains/dish/dish-cache.service';
import { DishAggregatorService } from '../dish-aggregator.service';

describe('DishReadService', () => {
    let service: DishReadService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [
                DishReadService,
                {
                    provide: ProviderRegistryService,
                    useValue: mockProviderRegistryService
                },
                {
                    provide: DishCacheService,
                    useValue: mockDishCacheService
                },
                {
                    provide: DishAggregatorService,
                    useValue: mockDishAggregatorService
                }
            ]
        }).compile();

        service = module.get(DishReadService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getDishes', () => {
        it('should return cached dishes when available', async () => {
            const cachedDishes = [dishResultVoFixture, dishResultVoFixture2];
            mockDishCacheService.getDishes.mockResolvedValueOnce(cachedDishes);

            const result = await service.getDishes(providedIngredientsFixture, mergedIngredientsFixture, mealTypeFixture);

            expect(result.dishResultsVos).toEqual(cachedDishes);
            expect(result.fromCache).toBe(true);
            expect(mockDishCacheService.getDishes).toHaveBeenCalledWith(providedIngredientsFixture);
            expect(mockDishAggregatorService.aggregateDishResults).not.toHaveBeenCalled();
        });

        it('should fetch and cache dishes when not cached', async () => {
            const fetchedDishes = [dishResultVoFixture];
            mockDishCacheService.getDishes.mockResolvedValueOnce(null);
            mockDishAggregatorService.aggregateDishResults.mockResolvedValueOnce(fetchedDishes);

            const result = await service.getDishes(providedIngredientsFixture, mergedIngredientsFixture, mealTypeFixture);

            expect(result.dishResultsVos).toEqual(fetchedDishes);
            expect(result.fromCache).toBe(false);
            expect(mockDishCacheService.getDishes).toHaveBeenCalledWith(providedIngredientsFixture);
            expect(mockDishAggregatorService.aggregateDishResults).toHaveBeenCalledWith(mergedIngredientsFixture, mealTypeFixture);
            expect(mockDishCacheService.setDishes).toHaveBeenCalledWith(providedIngredientsFixture, fetchedDishes);
        });

        it('should work without meal type filter', async () => {
            const fetchedDishes = [dishResultVoFixture];
            mockDishCacheService.getDishes.mockResolvedValueOnce(null);
            mockDishAggregatorService.aggregateDishResults.mockResolvedValueOnce(fetchedDishes);

            const result = await service.getDishes(providedIngredientsFixture, mergedIngredientsFixture);

            expect(result.dishResultsVos).toEqual(fetchedDishes);
            expect(mockDishAggregatorService.aggregateDishResults).toHaveBeenCalledWith(mergedIngredientsFixture, undefined);
        });
    });

    describe('getDishDetails', () => {
        it('should return cached dish details when available', async () => {
            mockDishCacheService.getDishDetails.mockResolvedValueOnce(dishDetailsVoFixture);

            const result = await service.getDishDetails(encodedDishIdVoFixture);

            expect(result.dishDetailsVo).toEqual(dishDetailsVoFixture);
            expect(result.fromCache).toBe(true);
            expect(mockDishCacheService.getDishDetails).toHaveBeenCalledWith(encodedDishIdVoFixture);
            expect(mockProvidable.getDishDetails).not.toHaveBeenCalled();
        });

        it('should fetch and cache dish details when not cached', async () => {
            mockDishCacheService.getDishDetails.mockResolvedValueOnce(null);
            mockProvidable.getDishDetails.mockResolvedValueOnce(dishDetailsVoFixture);

            const result = await service.getDishDetails(encodedDishIdVoFixture);

            expect(result.dishDetailsVo).toEqual(dishDetailsVoFixture);
            expect(result.fromCache).toBe(false);
            expect(mockDishCacheService.getDishDetails).toHaveBeenCalledWith(encodedDishIdVoFixture);
            expect(mockProvidable.getDishDetails).toHaveBeenCalledWith(encodedDishIdVoFixture);
            expect(mockDishCacheService.setDishDetails).toHaveBeenCalledWith(encodedDishIdVoFixture, dishDetailsVoFixture);
        });

        it('should throw DishNotFoundError when dish not found', async () => {
            mockDishCacheService.getDishDetails.mockResolvedValueOnce(null);
            mockProvidable.getDishDetails.mockResolvedValueOnce(null);

            await expect(service.getDishDetails(encodedDishIdVoFixture)).rejects.toThrow(DishNotFoundError);
        });

        it('should throw DishNotAcceptedError when dish is soft added', async () => {
            mockDishCacheService.getDishDetails.mockResolvedValueOnce(null);
            mockProvidable.getDishDetails.mockResolvedValueOnce(softAddedDishDetailsVoFixture);

            await expect(service.getDishDetails(encodedDishIdVoFixture)).rejects.toThrow(DishNotAcceptedError);
        });

        it('should throw DishSoftDeletedError when dish is soft deleted', async () => {
            mockDishCacheService.getDishDetails.mockResolvedValueOnce(null);
            mockProvidable.getDishDetails.mockResolvedValueOnce(softDeletedDishDetailsVoFixture);

            await expect(service.getDishDetails(encodedDishIdVoFixture)).rejects.toThrow(DishSoftDeletedError);
        });
    });

    describe('getDishProposals', () => {
        it('should return dish proposals for user', async () => {
            const dishes = [dishResultVoFixture, dishResultVoFixture2];
            mockUserApiService.findAllRecentQueries.mockResolvedValueOnce(userSearchQueryEntitiesFixture);
            mockDishAggregatorService.aggregateDishResults.mockResolvedValueOnce(dishes);

            const result = await service.getDishProposals(userLoginFixture);

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(mockUserApiService.findAllRecentQueries).toHaveBeenCalledWith(userLoginFixture);
            expect(mockDishAggregatorService.aggregateDishResults).toHaveBeenCalledWith(['apple', 'banana', 'carrot', 'potato']);
        });
    });

    describe('getDishesWithSoftAdded', () => {
        it('should return dishes with soft added property', async () => {
            const softAddedDishes = [dishEntityFixture];
            mockDishApiService.getDishesWithSoftAdded.mockResolvedValueOnce(softAddedDishes);

            const result = await service.getDishesWithSoftAdded();

            expect(result).toEqual(softAddedDishes);
            expect(mockDishApiService.getDishesWithSoftAdded).toHaveBeenCalled();
        });
    });

    describe('getDishesWithSoftEdited', () => {
        it('should return dishes with soft edited property', async () => {
            const softEditedDishes = [dishEntityFixture];
            mockDishApiService.getDishesWithSoftEdited.mockResolvedValueOnce(softEditedDishes);

            const result = await service.getDishesWithSoftEdited();

            expect(result).toEqual(softEditedDishes);
            expect(mockDishApiService.getDishesWithSoftEdited).toHaveBeenCalled();
        });
    });

    describe('getDishesWithSoftDeleted', () => {
        it('should return dishes with soft deleted property', async () => {
            const softDeletedDishes = [dishEntityFixture];
            mockDishApiService.getDishesWithSoftDeleted.mockResolvedValueOnce(softDeletedDishes);

            const result = await service.getDishesWithSoftDeleted();

            expect(result).toEqual(softDeletedDishes);
            expect(mockDishApiService.getDishesWithSoftDeleted).toHaveBeenCalled();
        });
    });

    describe('getDishComments', () => {
        it('should return dish comments', async () => {
            const comments = [dishCommentVoFixture, dishCommentVoFixture2];
            mockDishApiService.findByDishId.mockResolvedValueOnce(dishEntityFixture);
            mockDishApiService.getAllComments.mockResolvedValueOnce(comments as any);

            const result = await service.getDishComments(encodedDishIdVoFixture);

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(mockDishApiService.findByDishId).toHaveBeenCalledWith('123');
            expect(mockDishApiService.getAllComments).toHaveBeenCalledWith('123');
        });

        it('should throw DishNotFoundError when dish not found', async () => {
            mockDishApiService.findByDishId.mockResolvedValueOnce(null);

            await expect(service.getDishComments(encodedDishIdVoFixture)).rejects.toThrow(DishNotFoundError);
        });
    });

    describe('getDishRating', () => {
        it('should return dish rating', async () => {
            const ratingData = {
                getAverageRating: () => 4.5,
                getRatingCount: () => 10
            };
            mockDishApiService.findByDishId.mockResolvedValueOnce(dishEntityFixture);
            mockDishApiService.getAverageRatingForDish.mockResolvedValueOnce(ratingData as any);

            const result = await service.getDishRating(encodedDishIdVoFixture);

            expect(result).toBeDefined();
            expect(result.averageRating).toBe(4.5);
            expect(result.ratingNumber).toBe(10);
            expect(mockDishApiService.findByDishId).toHaveBeenCalledWith('123');
            expect(mockDishApiService.getAverageRatingForDish).toHaveBeenCalledWith('123');
        });

        it('should throw DishNotFoundError when dish not found', async () => {
            mockDishApiService.findByDishId.mockResolvedValueOnce(null);

            await expect(service.getDishRating(encodedDishIdVoFixture)).rejects.toThrow(DishNotFoundError);
        });
    });

    describe('hasDish', () => {
        it('should return true when dish is cached', async () => {
            mockDishCacheService.hasDish.mockResolvedValueOnce(true);

            const result = await service.hasDish(encodedDishIdVoFixture);

            expect(result).toBe(true);
            expect(mockDishCacheService.hasDish).toHaveBeenCalledWith(encodedDishIdVoFixture);
            expect(mockProvidable.getDishDetails).not.toHaveBeenCalled();
        });

        it('should return true when dish exists and cache it', async () => {
            mockDishCacheService.hasDish.mockResolvedValueOnce(false);
            mockProvidable.getDishDetails.mockResolvedValueOnce(dishDetailsVoFixture);

            const result = await service.hasDish(encodedDishIdVoFixture);

            expect(result).toBe(true);
            expect(mockDishCacheService.hasDish).toHaveBeenCalledWith(encodedDishIdVoFixture);
            expect(mockProvidable.getDishDetails).toHaveBeenCalledWith(encodedDishIdVoFixture);
            expect(mockDishCacheService.setDishDetails).toHaveBeenCalledWith(encodedDishIdVoFixture, dishDetailsVoFixture);
        });

        it('should return false when dish does not exist', async () => {
            mockDishCacheService.hasDish.mockResolvedValueOnce(false);
            mockProvidable.getDishDetails.mockResolvedValueOnce(null);

            const result = await service.hasDish(encodedDishIdVoFixture);

            expect(result).toBe(false);
            expect(mockDishCacheService.hasDish).toHaveBeenCalledWith(encodedDishIdVoFixture);
            expect(mockProvidable.getDishDetails).toHaveBeenCalledWith(encodedDishIdVoFixture);
            expect(mockDishCacheService.setDishDetails).not.toHaveBeenCalled();
        });
    });
});