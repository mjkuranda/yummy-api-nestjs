import { AddRecipeUseCase } from './add-recipe.use-case';
import { CreateRecipeDto } from '../dtos';
import { NotFoundException, ForbiddenException, BadRequestException } from '../../../../exceptions';
import {
    DishNotFoundError,
    DishRecipeExistsError,
    NotDishAuthorError,
    DishRecipeNotFoundError
} from '../../../dish/domain/errors';
import { InvalidMongooseObjectIdError } from '../../../../common/errors';

describe('AddRecipeUseCase', () => {
    let useCase: AddRecipeUseCase;
    let mockDishTokenService: any;
    let mockRecipeService: any;
    let mockLoggerService: any;

    const encodedDishId = 'encoded-dish-id';
    const decodedDishId = { id: 'dish-id' };
    const createRecipeDto: CreateRecipeDto = {
        language: 'en',
        dishId: 'dish-id',
        sections: [{ name: 'Section 1', steps: ['step1', 'step2'] }]
    } as any;
    const userDto = { login: 'user1', isAdmin: false } as any;

    // Helper to access protected handleError
    class TestableAddRecipeUseCase extends AddRecipeUseCase {
        public callHandleError(error: unknown, context: string) {
            // context must be of type `${string}/${string}`
            return this.handleError(error, context as any);
        }
    }

    beforeEach(() => {
        mockDishTokenService = { decode: jest.fn().mockReturnValue(decodedDishId) };
        mockRecipeService = { create: jest.fn() };
        mockLoggerService = { info: jest.fn() };
        useCase = new TestableAddRecipeUseCase(
            mockDishTokenService,
            mockRecipeService,
            mockLoggerService
        );
    });

    it('should call dependencies and log on success', async () => {
        await useCase.run(encodedDishId, createRecipeDto, userDto);
        expect(mockDishTokenService.decode).toHaveBeenCalledWith(encodedDishId);
        expect(mockRecipeService.create).toHaveBeenCalledWith(decodedDishId, createRecipeDto, userDto);
        expect(mockLoggerService.info).toHaveBeenCalledWith(
            'AddRecipeUseCase/run',
            expect.stringContaining('New recipe has been created')
        );
    });

    it('should throw NotFoundException for InvalidMongooseObjectIdError', () => {
        const error = new InvalidMongooseObjectIdError('invalid id');
        expect(() => (useCase as any).callHandleError(error, 'Test/Context')).toThrow(NotFoundException);
    });

    it('should throw NotFoundException for DishNotFoundError', () => {
        const error = new DishNotFoundError('not found');
        expect(() => (useCase as any).callHandleError(error, 'Test/Context')).toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for NotDishAuthorError', () => {
        const error = new NotDishAuthorError();
        expect(() => (useCase as any).callHandleError(error, 'Test/Context')).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for DishRecipeExistsError', () => {
        const error = new DishRecipeExistsError('exists');
        expect(() => (useCase as any).callHandleError(error, 'Test/Context')).toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for DishRecipeNotFoundError', () => {
        const error = new DishRecipeNotFoundError('not found');
        expect(() => (useCase as any).callHandleError(error, 'Test/Context')).toThrow(BadRequestException);
    });

    it('should rethrow unknown errors', () => {
        const error = new Error('unknown');
        expect(() => (useCase as any).callHandleError(error, 'Test/Context')).toThrow(error);
    });
});