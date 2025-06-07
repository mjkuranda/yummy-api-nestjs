import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../../logger/logger.service';
import { DishReadService } from '../../read/dish-read.service';
import { UserSearchQueryRepository } from '../../../../mongodb/repositories/user-search-query.repository';
import { GetDishProposalsUseCase } from './get-dish-proposals.use-case';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { UserSearchQueryDocument } from '../../../../mongodb/documents/user-search-query.document';
import { ProposedDish } from '../../dish.types';
import { DishType, Provider, MealType } from '../../../../common/enums';
import { Document } from 'mongoose';

describe('GetDishProposalsUseCase', () => {
    let useCase: GetDishProposalsUseCase;
    let loggerService: LoggerService;
    let dishReadService: DishReadService;
    let userSearchQueryRepository: UserSearchQueryRepository;

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
    };

    const mockDishReadService = {
        getDishProposals: jest.fn(),
    };

    const mockUserSearchQueryRepository = {
        findAllRecentQueries: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetDishProposalsUseCase,
                { provide: LoggerService, useValue: mockLoggerService },
                { provide: DishReadService, useValue: mockDishReadService },
                { provide: UserSearchQueryRepository, useValue: mockUserSearchQueryRepository },
            ],
        }).compile();

        useCase = module.get<GetDishProposalsUseCase>(GetDishProposalsUseCase);
        loggerService = module.get<LoggerService>(LoggerService);
        dishReadService = module.get<DishReadService>(DishReadService);
        userSearchQueryRepository = module.get<UserSearchQueryRepository>(UserSearchQueryRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
        expect(loggerService).toBeDefined();
        expect(dishReadService).toBeDefined();
        expect(userSearchQueryRepository).toBeDefined();
    });

    describe('execute', () => {
        const mockUser: UserAccessTokenPayload = {
            login: 'testUser',
            capabilities: {
                canAdd: true,
                canEdit: true,
                canDelete: true
            },
            expirationTimestamp: Date.now() + 3600000 // 1 hour from now
        };

        const mockSearchQueries: UserSearchQueryDocument[] = [
            {
                login: 'testUser',
                ingredients: ['tomato', 'onion'],
                date: new Date(Date.now() - 1000),
            } as UserSearchQueryDocument & Document,
            {
                login: 'testUser',
                ingredients: ['tomato', 'garlic'],
                date: new Date(Date.now() - 2000),
            } as UserSearchQueryDocument & Document,
        ];

        const mockProposedDishes: ProposedDish[] = [
            {
                encodedDishId: 'dish-1',
                title: 'Test Dish 1',
                ingredients: ['tomato', 'onion', 'garlic'],
                recommendationPoints: 2,
                provider: Provider.INT_DMT_USER,
                type: DishType.MAIN_COURSE,
                mealType: MealType.DINNER,
            },
            {
                encodedDishId: 'dish-2',
                title: 'Test Dish 2',
                ingredients: ['tomato', 'garlic', 'basil'],
                recommendationPoints: 1,
                provider: Provider.INT_DMT_USER,
                type: DishType.MAIN_COURSE,
                mealType: MealType.DINNER,
            },
        ];

        it('should successfully get dish proposals', async () => {
            mockUserSearchQueryRepository.findAllRecentQueries.mockResolvedValue(mockSearchQueries);
            mockDishReadService.getDishProposals.mockResolvedValue(mockProposedDishes);

            const result = await useCase.execute(mockUser);

            expect(result).toEqual(mockProposedDishes);
            expect(userSearchQueryRepository.findAllRecentQueries).toHaveBeenCalledWith(mockUser.login);
            expect(dishReadService.getDishProposals).toHaveBeenCalledWith(
                ['tomato', 'onion', 'garlic'],
                expect.any(Object)
            );
            expect(loggerService.info).toHaveBeenCalledWith(
                'GetDishProposalsUseCase/execute',
                `Generated ${mockProposedDishes.length} dish proposals.`
            );
        });

        it('should return empty array when no search queries exist', async () => {
            mockUserSearchQueryRepository.findAllRecentQueries.mockResolvedValue([]);
            mockDishReadService.getDishProposals.mockResolvedValue([]);

            const result = await useCase.execute(mockUser);

            expect(result).toEqual([]);
            expect(userSearchQueryRepository.findAllRecentQueries).toHaveBeenCalledWith(mockUser.login);
            expect(dishReadService.getDishProposals).toHaveBeenCalledWith(
                [],
                expect.any(Object)
            );
            expect(loggerService.info).toHaveBeenCalledWith(
                'GetDishProposalsUseCase/execute',
                'Generated 0 dish proposals.'
            );
        });

        it('should handle database error', async () => {
            const error = new Error('Database error');
            mockUserSearchQueryRepository.findAllRecentQueries.mockRejectedValue(error);

            await expect(useCase.execute(mockUser))
                .rejects
                .toThrow(error);
        });
    });
});