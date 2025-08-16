import { Test } from '@nestjs/testing';
import { ProviderRegistryService } from '../../../../../provider-registry/provider-registry.service';
import {
    mockDishAggregatorService, mockDishApiService,
    mockProviderRegistryService
} from '../../../read/services/__mocks__/dish-read-services.mock';
import { IngredientService } from '../../../../../ingredient/ingredient.service';
import { DishWriteService } from '../dish-write.service';
import {
    createdDishResultFixture,
    createDishVoFixture,
    dishIdFixture,
    editDishVoFixture,
    encodedDishIdVoFixture,
    wrappedIngredientsWithImagesFixture
} from '../__fixtures__/dish-write.service.fixture';
import {
    DishAlreadySoftDeletedError,
    DishNotFoundError,
    EmptyDishIngredientListError,
    MissingDishAuthorError
} from '../../../errors';
import { DishDeletionStatusVo, DishEditionStatusVo } from '../../vos';
import { makeDishEntity, makeSoftDeletedDishEntity } from '../../../../../../common/__tests__/factories';

describe('DishWriteService', () => {
    let service: DishWriteService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [
                DishWriteService,
                {
                    provide: ProviderRegistryService,
                    useValue: mockProviderRegistryService
                },
                {
                    provide: IngredientService,
                    useValue: mockDishAggregatorService
                }
            ]
        }).compile();

        service = module.get(DishWriteService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('saveNewDish', () => {
        it('should fail when missing author', async () => {
            await expect(service.saveNewDish(createDishVoFixture, null as any, [])).rejects.toThrow(MissingDishAuthorError);
        });

        it('should fail when no ingredients provided', async () => {
            await expect(service.saveNewDish(createDishVoFixture, 'author', [])).rejects.toThrow(EmptyDishIngredientListError);
        });

        it('should create a new dish', async () => {
            const author = 'author';
            mockDishApiService.createNewDish.mockResolvedValueOnce(createdDishResultFixture);

            const result = await service.saveNewDish(createDishVoFixture, author, wrappedIngredientsWithImagesFixture);

            expect(result).toStrictEqual(createdDishResultFixture);
            expect(mockDishApiService.createNewDish).toHaveBeenCalledTimes(1);
            expect(mockDishApiService.createNewDish).toHaveBeenCalledWith(createDishVoFixture, author, wrappedIngredientsWithImagesFixture);
        });
    });

    describe('editDish', () => {
        it('should fail when dish does not exist', async () => {
            mockDishApiService.findByDishId.mockResolvedValueOnce(null);

            await expect(service.editDish(encodedDishIdVoFixture, editDishVoFixture)).rejects.toThrow(DishNotFoundError);
        });

        it('should successfully update and return new dish', async () => {
            const original = makeDishEntity({ id: dishIdFixture, title: 'old title' });
            const edited = makeDishEntity({ id: dishIdFixture, title: 'old title', softEdited: makeDishEntity({ title: 'new title' }) });

            mockDishApiService.findByDishId
                .mockResolvedValueOnce(original)
                .mockResolvedValueOnce(edited);

            const result = await service.editDish(encodedDishIdVoFixture, editDishVoFixture);

            expect(mockDishApiService.findByDishId).toHaveBeenCalledWith(dishIdFixture);
            expect(mockDishApiService.findByDishId).toHaveBeenCalledTimes(2);
            expect(mockDishApiService.insertEditionForDish).toHaveBeenCalledWith(dishIdFixture, editDishVoFixture);
            expect(result).toStrictEqual(new DishEditionStatusVo('new title'));
        });
    });

    describe('deleteDish', () => {
        it('should fail when dish does not exist', async () => {
            mockDishApiService.findByDishId.mockResolvedValueOnce(null);

            await expect(service.deleteDish(encodedDishIdVoFixture)).rejects.toThrow(DishNotFoundError);
        });

        it('should fail when dish has already been soft-deleted earlier', async () => {
            const softDeleted = makeSoftDeletedDishEntity({ id: dishIdFixture });

            mockDishApiService.findByDishId.mockResolvedValueOnce(softDeleted);

            await expect(service.deleteDish(encodedDishIdVoFixture)).rejects.toThrow(DishAlreadySoftDeletedError);
        });

        it('should successfully mark the dish as a soft-deleted', async () => {
            const active = makeDishEntity({ id: dishIdFixture, title: 'title' });
            const deleted = makeSoftDeletedDishEntity({ id: dishIdFixture, title: 'title' });

            mockDishApiService.findByDishId
                .mockResolvedValueOnce(active)
                .mockResolvedValueOnce(deleted);

            const result = await service.deleteDish(encodedDishIdVoFixture);

            expect(mockDishApiService.setSoftDeletedForDish).toHaveBeenCalledTimes(1);
            expect(result).toStrictEqual(new DishDeletionStatusVo('title', true));
        });
    });

    describe('confirmCreating', () => {});

    describe('confirmEditing', () => {});

    describe('confirmDeleting', () => {});

    describe('addDishProposal', () => {});

    describe('addDishComment', () => {});

    describe('addDishRating', () => {});
});