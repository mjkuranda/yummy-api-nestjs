import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../logger/logger.service';
import { IngredientService } from './ingredient.service';
import { IngredientType } from './ingredient.types';
import { AxiosService } from '../../services/axios.service';

describe('IngredientService', () => {
    let ingredientService: IngredientService;

    const loggerServiceProvider = {
        info: jest.fn(),
        error: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IngredientService,
                AxiosService,
                {
                    provide: LoggerService,
                    useValue: loggerServiceProvider
                }
            ]
        }).compile();

        ingredientService = module.get(IngredientService);
        ingredientService.onModuleInit();
    });

    it('should be defined', () => {
        expect(ingredientService).toBeDefined();
    });

    it('should filter ingredients when provided not supported ones', () => {
        const mockProvidedIngredients: IngredientType[] = ['focaccia', 'bagel', 'UNKNOWN', 'XXX'];
        const mockFilteredIngredients: IngredientType[] = ['focaccia', 'bagel'];

        const filteredIngredients: IngredientType[] = ingredientService.filterIngredients(mockProvidedIngredients);

        expect(filteredIngredients).toEqual(mockFilteredIngredients);
    });
});
