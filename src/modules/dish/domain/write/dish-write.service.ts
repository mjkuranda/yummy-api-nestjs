import { Injectable } from '@nestjs/common';
import { ProviderRegistryService } from '../../../provider/provider-registry.service';
import { CreateDishDataType } from '../../dish.types';
import { DishDocument } from '../../../../mongodb/documents/dish.document';
import { DishRepository } from '../../../../mongodb/repositories/dish.repository';
import { DishCacheService } from '../../../cache/dish/dish-cache.service';
import { CreateDishCommentBody, CreateDishRatingBody, DishEditDto } from '../../dish.dto';
import { DishIngredient } from '../../../ingredient/ingredient.types';
import { DishCommentRepository } from '../../../../mongodb/repositories/dish-comment.repository';
import { DishRatingRepository } from '../../../../mongodb/repositories/dish-rating.repository';
import {
    DishDeletionFailedError,
    DishNotAcceptedError,
    DishNotFoundError,
    DishSoftDeletedError,
    EmptyDishIngredientListError,
    MissingDishAuthorError
} from '../../../../errors/domain';
import { IngredientService } from '../../../ingredient/ingredient.service';
import { UserSearchQueryRepository } from '../../../../mongodb/repositories/user-search-query.repository';
import { Provider } from '../../../../common/enums';
import {
    AddDishRatingStatusValueObject,
    DishDeletionConfirmationStatusValueObject,
    DishDeletionStatusValueObject,
    DishEditionStatusValueObject
} from './value-objects';
import { DishFactory } from '../common/factories';
import { DishEntity } from '../common/entities';
import { EncodedDishIdValueObject } from '../common/value-objects';

@Injectable()
export class DishWriteService {

    private readonly dishRepository: DishRepository;

    constructor(
        private readonly providerRegistryService: ProviderRegistryService,
        private readonly dishCacheService: DishCacheService,
        private readonly dishCommentRepository: DishCommentRepository,
        private readonly dishRatingRepository: DishRatingRepository,
        private readonly userSearchQueryRepository: UserSearchQueryRepository,
        private readonly ingredientService: IngredientService
    ) {
        this.dishRepository = this.providerRegistryService.getDishRepository();
    }

    /**
     * @description creates and saves a new dish to the database
     * @param createData includes data to create a new dish
     * @param author user who creates this dish
     * @param ingredients list of dish ingredients
     * @returns dish domain entity
     */
    async saveNewDish(createData: CreateDishDataType, author: string, ingredients: DishIngredient[]): Promise<DishEntity> {
        if (!author) {
            throw new MissingDishAuthorError();
        }

        if (!ingredients || ingredients.length === 0) {
            throw new EmptyDishIngredientListError();
        }

        const dishDocument = await this.dishRepository.create(createData, author, ingredients);

        return DishFactory.fromDocument(dishDocument);
    }

    /**
     * @description inserts edited data to the dish
     * @param encodedDishId encoded dish ID with its provider
     * @param dishEditDto dish edit data
     * @returns dish edition status that indicates the dish that was edited
     */
    async editDish(encodedDishId: EncodedDishIdValueObject, dishEditDto: DishEditDto<DishIngredient>): Promise<DishEditionStatusValueObject> {
        const dishId = encodedDishId.getDishId();

        const dish = await this.dishRepository.findById(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        await this.dishRepository.insertEdition(dishId, dishEditDto);

        const editedDish = await this.dishRepository.findById(dishId);
        const dishTitle = editedDish.getTitle();

        return new DishEditionStatusValueObject(dishTitle);
    }

    /**
     * @description Marks as a soft-deleted
     * @param encodedDishId encoded dish ID and its provider name
     * @returns dish deletion status that indicates dish soft-deleting along with its title
     */
    async deleteDish(encodedDishId: EncodedDishIdValueObject): Promise<DishDeletionStatusValueObject> {
        const dishId = encodedDishId.getDishId();
        const dish = await this.dishRepository.findById(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        await this.dishCacheService.deleteDish(encodedDishId);
        await this.dishRepository.setSoftDeleted(dishId);

        const deletedDish = await this.dishRepository.findById(dishId);

        if (!deletedDish.isSoftDeleted()) {
            throw new DishDeletionFailedError(encodedDishId);
        }

        return new DishDeletionStatusValueObject(
            deletedDish.getTitle(),
            deletedDish.isSoftDeleted()
        );
    }

    /**
     * @description confirms creating a new dish
     * @param encodedDishId encoded dish id with its provider name
     * @returns domain dish entity
     */
    async confirmCreating(encodedDishId: EncodedDishIdValueObject): Promise<DishEntity> {
        const id = encodedDishId.getDishId();
        const dish = await this.dishRepository.findById(id);

        await this.dishRepository.unsetSoftAdded(dish._id);

        const addedDish = await this.dishRepository.findById(dish._id);
        const dishEntity = DishFactory.fromDocument(addedDish);

        await this.dishCacheService.setDishDetails(encodedDishId, dishEntity);

        return dishEntity;
    }

    /**
     * @description Confirms new dish version
     * @param encodedDishId encoded dish ID and its provider name
     * @returns domain dish entity
     */
    async confirmEditing(encodedDishId: EncodedDishIdValueObject): Promise<DishEntity> {
        const dishId = encodedDishId.getDishId();
        const dish = await this.dishRepository.findById(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        await this.dishRepository.confirmEdition(dishId, dish.softEdited);
        const updatedDish = await this.dishRepository.findById(dishId);
        const dishEntity = DishFactory.fromDocument(updatedDish);
        await this.dishCacheService.setDishDetails(encodedDishId, dishEntity);

        return dishEntity;
    }

    /**
     * @description Confirms deletion of the particular dish
     * @param encodedDishId encoded dish ID and its provider name
     * @returns dish deletion confirmation status along with success information
     */
    async confirmDeleting(encodedDishId: EncodedDishIdValueObject): Promise<DishDeletionConfirmationStatusValueObject> {
        const dishId = encodedDishId.getDishId();
        const dish = await this.dishRepository.findById(dishId) as DishDocument;

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        await this.dishCacheService.deleteDish(dish._id);
        await this.dishCommentRepository.deleteAll(dish._id);
        await this.dishRatingRepository.deleteAll(dish._id);
        await this.dishRepository.delete(dish._id);

        const deletedDish = await this.dishRepository.findById(dish._id);

        return new DishDeletionConfirmationStatusValueObject(
            dish.title,
            deletedDish !== null
        );
    }

    /**
     * @description Adds a new search query for a particular user
     * @param userLogin
     * @param ingredients
     * @returns void
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
     * @returns void
     */
    async addDishComment(createDishCommentBody: CreateDishCommentBody, userLogin: string): Promise<void> {
        const providable = this.providerRegistryService.getProvider(Provider.INT_DMT_USER);
        const dishDetailsWithMetadata = await providable.getDishDetails(createDishCommentBody.encodedDishId);

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
     * @returns add dish rating status if is new rating or not
     */
    async addDishRating(createDishRatingBody: CreateDishRatingBody, userLogin: string): Promise<AddDishRatingStatusValueObject> {
        const providable = this.providerRegistryService.getProvider(Provider.INT_DMT_USER);
        const dishDetailsWithMetadata = await providable.getDishDetails(createDishRatingBody.encodedDishId);

        if (!dishDetailsWithMetadata) {
            throw new DishNotFoundError(createDishRatingBody.encodedDishId);
        }

        const encodedDishId = EncodedDishIdValueObject.fromEncodedString(createDishRatingBody.encodedDishId.getValue());
        const dishId = encodedDishId.getDishId();

        const rating = await this.dishRatingRepository.findOne({
            dishId,
            user: userLogin
        });

        if (rating) {
            // TODO: Do not return
            await this.dishRatingRepository.updateAndReturn(createDishRatingBody, userLogin);

            return new AddDishRatingStatusValueObject(false);
        }

        // TODO: Simplify creation
        await this.dishRatingRepository.create({ ...createDishRatingBody, user: userLogin, posted: Date.now() });

        return new AddDishRatingStatusValueObject(true);
    }
}