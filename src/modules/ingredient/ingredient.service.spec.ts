import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../logger/logger.service';
import { IngredientService } from './ingredient.service';
import { RedisService } from '../redis/redis.service';

describe('IngredientService', () => {
    let ingredientService: IngredientService;
    let redisService: RedisService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IngredientService,
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
                        set: jest.fn()
                    }
                }
            ],
        }).compile();

        ingredientService = module.get(IngredientService);
        redisService = module.get(RedisService);
    });

    it('should be defined', () => {
        expect(ingredientService).toBeDefined();
        expect(redisService).toBeDefined();
    });
});
