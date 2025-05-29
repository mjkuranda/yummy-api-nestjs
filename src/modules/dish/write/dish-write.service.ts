import { Injectable } from '@nestjs/common';
import { DishSourceRegistryService } from '../source/dish-source-registry.service';
import { CreateDishDataType, DetailedDish } from '../dish.types';
import { DishDocument } from '../../../mongodb/documents/dish.document';
import { DishRepository } from '../../../mongodb/repositories/dish.repository';
import { EncodedDishId } from '../../../common/types';
import { DishIdObfuscator } from '../../../common/helpers/dish-id-obfuscator.helper';
import { DishCacheService } from '../../cache/dish-cache.service';
import { proceedDishDocumentToDishDetails } from '../dish.utils';
import { CreateDishCommentBody, CreateDishRatingBody, DishEditDto } from '../dish.dto';
import { DishIngredient } from '../../ingredient/ingredient.types';
import { DishCommentRepository } from '../../../mongodb/repositories/dish-comment.repository';
import { DishRatingRepository } from '../../../mongodb/repositories/dish-rating.repository';
import { DishNotFoundError } from '../../../errors/domain/dish-not-found.error';
import { DishNotAcceptedError } from '../../../errors/domain/dish-not-accepted.error';
import { DishSoftDeletedError } from '../../../errors/domain/dish-soft-deleted.error';
import { IngredientService } from '../../ingredient/ingredient.service';
import { UserSearchQueryRepository } from '../../../mongodb/repositories/user-search-query.repository';
import { InvalidDishIdError } from '../../../errors/domain/invalid-dish-id.error';
import { AddDishRatingResult, ConfirmDeletingResult, DeleteDishResult, EditDishResult } from './dish-write.types';
import { DishDeletionFailedError } from '../../../errors/domain/dish-deletion-failed.error';

@Injectable()
export class DishWriteService {

    private readonly dishRepository: DishRepository;

    constructor(
        private readonly dishSourceRegistryService: DishSourceRegistryService,
        private readonly dishCacheService: DishCacheService,
        private readonly dishCommentRepository: DishCommentRepository,
        private readonly dishRatingRepository: DishRatingRepository,
        private readonly userSearchQueryRepository: UserSearchQueryRepository,
        private readonly ingredientService: IngredientService
    ) {
        this.dishRepository = this.dishSourceRegistryService.getDishRepositoryProvider();
    }

    /**
     * @description creates and saves a new dish to the database
     * @param createData includes data to create a new dish
     */
    async saveNewDish(createData: CreateDishDataType): Promise<DishDocument> {
        return await this.dishRepository.create(createData);
    }

    /**
     * @description inserts edited data to the dish
     * @param encodedDishId encoded dish ID with its provider
     * @param dishEditDto dish edit data
     */
    async editDish(encodedDishId: EncodedDishId, dishEditDto: DishEditDto<DishIngredient>): Promise<EditDishResult> {
        const decodedId = DishIdObfuscator.decode(encodedDishId);

        if (!decodedId) {
            throw new InvalidDishIdError(encodedDishId);
        }

        const { dishId } = decodedId;

        const dish = await this.dishRepository.findById(dishId) as DishDocument;

        await this.dishRepository.insertEdition(dish._id, dishEditDto);

        const editedDish = await this.dishRepository.findById(dish._id) as DishDocument;

        return { dishTitle: editedDish.title };
    }

    /**
     * @description Marks as a soft-deleted
     * @param encodedDishId encoded dish ID and its provider name
     */
    async deleteDish(encodedDishId: EncodedDishId): Promise<DeleteDishResult> {
        const decoded = DishIdObfuscator.decode(encodedDishId);

        if (!decoded) {
            throw new InvalidDishIdError(encodedDishId);
        }

        const { dishId } = decoded;
        const dish = await this.dishRepository.findById(dishId) as DishDocument;

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        await this.dishCacheService.deleteDish(dish._id);
        await this.dishRepository.setSoftDeleted(dish._id);

        const deletedDish = await this.dishRepository.findById(dish._id) as DishDocument;

        if (!deletedDish.softDeleted) {
            throw new DishDeletionFailedError(encodedDishId);
        }

        return {
            dishTitle: deletedDish.title,
            isSoftDeleted: true
        };
    }

    /**
     * @description confirms creating a new dish
     * @param encodedDishId encoded dish id with its provider name
     */
    async confirmCreating(encodedDishId: EncodedDishId): Promise<DetailedDish> {
        const { dishId: id } = DishIdObfuscator.decode(encodedDishId);

        const dish = await this.dishRepository.findById(id) as DishDocument;

        await this.dishRepository.unsetSoftAdded(dish._id);

        const addedDish = await this.dishRepository.findById(dish._id) as DishDocument;
        const detailedDish = proceedDishDocumentToDishDetails(addedDish);

        await this.dishCacheService.setDishDetails(encodedDishId, detailedDish);

        return detailedDish;
    }

    /**
     * @description Confirms new dish version
     * @param encodedDishId encoded dish ID and its provider name
     */
    async confirmEditing(encodedDishId: string): Promise<DishDocument> {
        const decoded = DishIdObfuscator.decode(encodedDishId);

        if (!decoded) {
            throw new InvalidDishIdError(encodedDishId);
        }

        const { dishId } = decoded;
        const dish = await this.dishRepository.findById(dishId) as DishDocument;

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        await this.dishRepository.confirmEdition(encodedDishId, dish.softEdited);
        const updatedDish = await this.dishRepository.findById(dishId) as DishDocument;
        const detailedDish = proceedDishDocumentToDishDetails(updatedDish);
        await this.dishCacheService.setDishDetails(encodedDishId, detailedDish);

        return updatedDish as DishDocument;
    }

    /**
     * @description Confirms deletion of the particular dish
     * @param encodedDishId encoded dish ID and its provider name
     */
    async confirmDeleting(encodedDishId: EncodedDishId): Promise<ConfirmDeletingResult> {
        const decodedId = DishIdObfuscator.decode(encodedDishId);

        if (!decodedId) {
            throw new InvalidDishIdError(encodedDishId);
        }

        const { dishId } = decodedId;

        const dish = await this.dishRepository.findById(dishId) as DishDocument;

        if (!dish) {
            throw new DishNotFoundError(dishId);
        }

        await this.dishCacheService.deleteDish(dish._id);
        await this.dishCommentRepository.deleteAll(dish._id);
        await this.dishRatingRepository.deleteAll(dish._id);
        await this.dishRepository.delete(dish._id);

        const deletedDish = await this.dishRepository.findById(dish._id) as (DishDocument | null);

        return {
            wasDeleted: deletedDish !== null,
            dishTitle: dish.title
        };
    }

    /**
     * @description Adds a new search query for a particular user
     * @param userLogin
     * @param ingredients
     */
    async addDishProposal(userLogin: string, ingredients: string[]): Promise<void> {
        const filteredIngredients = this.ingredientService.filterIngredients(ingredients);
        // TODO: Simplify this create method
        await this.userSearchQueryRepository.create({ ingredients: filteredIngredients, date: new Date(), login: userLogin });
    }

    /**
     * @description Adds a new comment to the particular dish
     * @param createDishCommentBody dish ID and comment content
     * @param userLogin user login
     */
    async addDishComment(createDishCommentBody: CreateDishCommentBody, userLogin: string): Promise<void> {
        const dishDetailsWithMetadata = await this.dishRepository.getDishDetails(createDishCommentBody.encodedDishId);

        if (!dishDetailsWithMetadata) {
            throw new DishNotFoundError(createDishCommentBody.encodedDishId);
        }

        const { metadata } = dishDetailsWithMetadata;

        if (metadata.softAdded) {
            throw new DishNotAcceptedError(createDishCommentBody.encodedDishId);
        }

        if (metadata.softDeleted) {
            throw new DishSoftDeletedError(createDishCommentBody.encodedDishId);
        }

        // TODO: simplify object to create, e.g. posted inside repository
        await this.dishCommentRepository.create({ ...createDishCommentBody, user: userLogin, posted: Date.now() });
    }

    /**
     * @description Adds a new or update existing rating to the particular dish
     * @param createDishRatingBody dish ID and rating value
     * @param userLogin user login
     */
    async addDishRating(createDishRatingBody: CreateDishRatingBody, userLogin: string): Promise<AddDishRatingResult> {
        const dishDetailsWithMetadata = await this.dishRepository.getDishDetails(createDishRatingBody.encodedDishId);

        if (!dishDetailsWithMetadata) {
            throw new DishNotFoundError(createDishRatingBody.encodedDishId);
        }

        const decodedId = DishIdObfuscator.decode(createDishRatingBody.encodedDishId);

        if (!decodedId) {
            throw new InvalidDishIdError(createDishRatingBody.encodedDishId);
        }

        const { dishId } = decodedId;
        const rating = await this.dishRatingRepository.findOne({
            dishId,
            user: userLogin
        });

        if (rating) {
            const updatedRating = await this.dishRatingRepository.updateAndReturn(createDishRatingBody, userLogin);

            return {
                dishRating: updatedRating,
                isNew: false
            };
        }

        const newRating = await this.dishRatingRepository.create({ ...createDishRatingBody, user: userLogin, posted: Date.now() });

        return {
            dishRating: newRating,
            isNew: true
        };
    }
}