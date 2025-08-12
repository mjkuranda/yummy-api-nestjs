import { ProviderRegistryService } from '../../../../../provider-registry/provider-registry.service';
import { Test } from '@nestjs/testing';
import {
    mockProvidable,
    mockProviderRegistryService
} from '../../../../../recipe/domain/services/__mocks__/recipe-services.mock';
import { DishAggregatorService } from '../dish-aggregator.service';
import {
    ingredientsFixture,
    mealTypeFixture,
    resultDishesListFixture
} from '../__fixtures__/dish-aggregator.service.fixture';

describe('DishAggregatorService', () => {
    let service: DishAggregatorService;
    let providerRegistryService: jest.Mocked<ProviderRegistryService>;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [
                DishAggregatorService,
                {
                    provide: ProviderRegistryService,
                    useValue: mockProviderRegistryService
                }
            ]
        }).compile();

        service = module.get(DishAggregatorService);
        providerRegistryService = module.get(ProviderRegistryService);
    });

    describe('aggregateDishResults', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should aggregate all results and return', async () => {
            mockProvidable.getDishes.mockResolvedValueOnce(resultDishesListFixture);

            const result = await service.aggregateDishResults(ingredientsFixture, mealTypeFixture);

            expect(result.length).toEqual(1);
            expect(resultDishesListFixture.length).toEqual(3);
            expect(providerRegistryService.getAllProviders).toHaveBeenCalled();

            expect(result[0]).toBeDefined();
            expect(result[0].relevance).toBeGreaterThan(0);
            expect(result[0].mealType).toBe(mealTypeFixture);
        });
    });
});