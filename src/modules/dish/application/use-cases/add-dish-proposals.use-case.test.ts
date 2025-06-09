import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../domain/write/dish-write.service';
import { AddDishProposalsUseCase } from './add-dish-proposals.use-case';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';

describe('AddDishProposalsUseCase', () => {
    let useCase: AddDishProposalsUseCase;
    let loggerService: LoggerService;
    let dishWriteService: DishWriteService;

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
    };

    const mockDishWriteService = {
        addDishProposal: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AddDishProposalsUseCase,
                { provide: LoggerService, useValue: mockLoggerService },
                { provide: DishWriteService, useValue: mockDishWriteService },
            ],
        }).compile();

        useCase = module.get<AddDishProposalsUseCase>(AddDishProposalsUseCase);
        loggerService = module.get<LoggerService>(LoggerService);
        dishWriteService = module.get<DishWriteService>(DishWriteService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
        expect(loggerService).toBeDefined();
        expect(dishWriteService).toBeDefined();
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
        const mockIngredients = ['tomato', 'onion', 'garlic'];

        it('should successfully add dish proposal', async () => {
            mockDishWriteService.addDishProposal.mockResolvedValue(undefined);

            await useCase.execute(mockUser, mockIngredients);

            expect(dishWriteService.addDishProposal).toHaveBeenCalledWith(mockUser.login, mockIngredients);
            expect(loggerService.info).toHaveBeenCalledWith(
                'AddDishProposalsUseCase/execute',
                `Added search query for user ${mockUser.login}.`
            );
        });

        it('should handle empty ingredients array', async () => {
            mockDishWriteService.addDishProposal.mockResolvedValue(undefined);

            await useCase.execute(mockUser, []);

            expect(dishWriteService.addDishProposal).toHaveBeenCalledWith(mockUser.login, []);
            expect(loggerService.info).toHaveBeenCalledWith(
                'AddDishProposalsUseCase/execute',
                `Added search query for user ${mockUser.login}.`
            );
        });

        it('should handle database error', async () => {
            const error = new Error('Database error');
            mockDishWriteService.addDishProposal.mockRejectedValue(error);

            await expect(useCase.execute(mockUser, mockIngredients))
                .rejects
                .toThrow(error);
        });
    });
});