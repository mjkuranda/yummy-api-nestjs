import { Injectable } from '@nestjs/common';
import { ProviderRegistryService } from '../../../provider-registry/provider-registry.service';
import { CreateDishDataType } from '../../dish.types';
import { DishCacheService } from '../../../cache/domains/dish/dish-cache.service';
import { DishEditDto } from '../../dish.dto';
import { DishIngredient } from '../../../ingredient/ingredient.types';
import { IngredientService } from '../../../ingredient/ingredient.service';
import { Provider } from '../../../../common/enums';
import {
    AddDishRatingStatusValueObject,
    DishDeletionConfirmationStatusValueObject,
    DishDeletionStatusValueObject,
    DishEditionStatusValueObject
} from './value-objects';
import { DishEntity } from '../common/entities';
import { EncodedDishIdValueObject } from '../common/value-objects';
import { DishDetailsValueObject } from '../read/value-objects';
import { DishDataManageable, UserDataManageable } from '../../../provider-registry/data-manageable.interface';
import {
    DishDeletionFailedError, DishNotAcceptedError,
    DishNotFoundError, DishSoftDeletedError,
    EmptyDishIngredientListError,
    MissingDishAuthorError
} from '../errors';

@Injectable()
export class DishWriteService {

    private readonly dishApiService: DishDataManageable;
    private readonly userApiService: UserDataManageable;

    constructor(
        private readonly providerRegistryService: ProviderRegistryService,
        private readonly dishCacheService: DishCacheService,
        private readonly ingredientService: IngredientService
    ) {
        this.dishApiService = this.providerRegistryService.getDishApiService();
        this.userApiService = this.providerRegistryService.getUserApiService();
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

        return await this.dishApiService.createNewDish(createData, author, ingredients);
    }

    /**
     * @description inserts edited data to the dish
     * @param encodedDishId encoded dish ID with its provider
     * @param dishEditDto dish edit data
     * @returns dish edition status that indicates the dish that was edited
     */
    async editDish(encodedDishId: EncodedDishIdValueObject, dishEditDto: DishEditDto<DishIngredient>): Promise<DishEditionStatusValueObject> {
        const dishId = encodedDishId.getDishId();

        const dish = await this.dishApiService.findByDishId(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        await this.dishApiService.insertEditionForDish(dishId, dishEditDto);

        const editedDish = await this.dishApiService.findByDishId(dishId);
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
        const dish = await this.dishApiService.findByDishId(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        await this.dishCacheService.deleteDish(encodedDishId);
        await this.dishApiService.setSoftDeletedForDish(dishId);

        const deletedDish = await this.dishApiService.findByDishId(dishId);

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
        const dish = await this.dishApiService.findByDishId(id);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        await this.dishApiService.unsetSoftAddedForDish(id);

        const addedDish = await this.dishApiService.findByDishId(id);
        const dishDetails = DishDetailsValueObject.fromEntity(addedDish);

        await this.dishCacheService.setDishDetails(encodedDishId, dishDetails);

        return addedDish;
    }

    /**
     * @description Confirms new dish version
     * @param encodedDishId encoded dish ID and its provider name
     * @returns domain dish entity
     */
    async confirmEditing(encodedDishId: EncodedDishIdValueObject): Promise<DishEntity> {
        const dishId = encodedDishId.getDishId();
        const dish = await this.dishApiService.findByDishId(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        const softEdited = dish.getSoftEdited();

        await this.dishApiService.confirmDishEdition(dishId, softEdited);

        const updatedDish = await this.dishApiService.findByDishId(dishId);
        const dishDetails = DishDetailsValueObject.fromEntity(updatedDish);

        await this.dishCacheService.setDishDetails(encodedDishId, dishDetails);

        return updatedDish;
    }

    /**
     * @description Confirms deletion of the particular dish
     * @param encodedDishId encoded dish ID and its provider name
     * @returns dish deletion confirmation status along with success information
     */
    async confirmDeleting(encodedDishId: EncodedDishIdValueObject): Promise<DishDeletionConfirmationStatusValueObject> {
        const dishId = encodedDishId.getDishId();
        const dish = await this.dishApiService.findByDishId(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        await this.dishCacheService.deleteDish(encodedDishId);
        await this.dishApiService.deleteAllComments(dishId);
        await this.dishApiService.deleteAllRatings(dishId);
        await this.dishApiService.deleteDish(dishId);

        const deletedDish = await this.dishApiService.findByDishId(dishId);
        const dishTitle = dish.getTitle();

        return new DishDeletionConfirmationStatusValueObject(
            dishTitle,
            deletedDish !== null
        );
    }

    /**
     * @description Adds a new search query for a particular user
     * @param userLogin user login
     * @param ingredients ingredients used to query
     * @returns void
     */
    async addDishProposal(userLogin: string, ingredients: string[]): Promise<void> {
        const filteredIngredients = this.ingredientService.filterIngredients(ingredients);

        await this.userApiService.insertNewQuery(userLogin, filteredIngredients);
    }

    /**
     * @description Adds a new comment to the particular dish
     * @param encodedDishId encoded dish ID and its provider name
     * @param userLogin user login
     * @param content comment text to post
     * @returns void
     */
    async addDishComment(encodedDishId: EncodedDishIdValueObject, userLogin: string, content: string): Promise<void> {
        const providable = this.providerRegistryService.getProvider(Provider.INT_DMT_USER);
        const dishDetailsVo = await providable.getDishDetails(encodedDishId);

        if (!dishDetailsVo) {
            throw new DishNotFoundError(encodedDishId);
        }

        if (dishDetailsVo.softAdded) {
            throw new DishNotAcceptedError(encodedDishId);
        }

        if (dishDetailsVo.softDeleted) {
            throw new DishSoftDeletedError(encodedDishId);
        }

        const dishId = encodedDishId.getDishId();

        await this.dishApiService.postNewComment(userLogin, content, dishId);
    }

    /**
     * @description Adds a new or update existing rating to the particular dish
     * @param encodedDishId encoded dish ID and its provider name
     * @param userLogin user login
     * @param rating integer value between 0-10
     * @returns add dish rating status if is new rating or not
     */
    async addDishRating(encodedDishId: EncodedDishIdValueObject, userLogin: string, rating: number): Promise<AddDishRatingStatusValueObject> {
        const providable = this.providerRegistryService.getProvider(Provider.INT_DMT_USER);
        const dishDetailsVo = await providable.getDishDetails(encodedDishId);

        if (!dishDetailsVo) {
            throw new DishNotFoundError(encodedDishId);
        }

        const dishId = encodedDishId.getDishId();

        const ratingEntity = await this.dishApiService.findRating(userLogin, dishId);

        if (ratingEntity) {
            await this.dishApiService.updateRating(userLogin, dishId, rating);

            return new AddDishRatingStatusValueObject(false);
        }

        await this.dishApiService.insertNewRating(userLogin, dishId, rating);

        return new AddDishRatingStatusValueObject(true);
    }
}