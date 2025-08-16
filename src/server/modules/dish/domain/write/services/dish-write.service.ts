import { Injectable } from '@nestjs/common';
import { ProviderRegistryService } from '../../../../provider-registry/provider-registry.service';
import { DishIngredient } from '../../../../ingredient/ingredient.types';
import { IngredientService } from '../../../../ingredient/ingredient.service';
import { Provider } from '../../../../../common/enums';
import {
    AddDishRatingStatusVo, CreateDishVo,
    DishDeletionConfirmationStatusVo,
    DishDeletionStatusVo,
    DishEditionStatusVo, EditDishVo
} from '../vos';
import { DishEntity } from '../../common/entities';
import { EncodedDishIdVo } from '../../common/vos';
import { DishDetailsVo } from '../../read/vos';
import { DishDataManageable, UserDataManageable } from '../../../../provider-registry/data-manageable.interface';
import {
    DishAlreadySoftDeletedError,
    DishNotAcceptedError,
    DishNotFoundError, DishSoftDeletedError,
    EmptyDishIngredientListError,
    MissingDishAuthorError
} from '../../errors';

@Injectable()
export class DishWriteService {

    private readonly dishApiService: DishDataManageable;
    private readonly userApiService: UserDataManageable;

    constructor(
        private readonly providerRegistryService: ProviderRegistryService,
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
    async saveNewDish(createData: CreateDishVo, author: string, ingredients: DishIngredient[]): Promise<DishEntity> {
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
     * @param encodedDishIdVo encoded dish ID with its provider
     * @param editDishVo dish edit data
     * @returns dish edition status that indicates the dish that was edited
     */
    async editDish(encodedDishIdVo: EncodedDishIdVo, editDishVo: EditDishVo): Promise<DishEditionStatusVo> {
        const encodedDishId = encodedDishIdVo.getValue();
        const dishId = encodedDishIdVo.getDishId();

        const dish = await this.dishApiService.findByDishId(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        await this.dishApiService.insertEditionForDish(dishId, editDishVo);

        const editedDish = await this.dishApiService.findByDishId(dishId);
        const softEditedData = editedDish.getSoftEdited();
        const dishTitle = softEditedData.getTitle();

        return new DishEditionStatusVo(dishTitle);
    }

    /**
     * @description Marks as a soft-deleted
     * @param encodedDishIdVo encoded dish ID and its provider name
     * @returns dish deletion status that indicates dish soft-deleting along with its title
     */
    async deleteDish(encodedDishIdVo: EncodedDishIdVo): Promise<DishDeletionStatusVo> {
        const encodedDishId = encodedDishIdVo.getValue();
        const dishId = encodedDishIdVo.getDishId();
        const dish = await this.dishApiService.findByDishId(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        if (dish.isSoftDeleted()) {
            throw new DishAlreadySoftDeletedError(encodedDishId);
        }

        await this.dishApiService.setSoftDeletedForDish(dishId);

        const deletedDish = await this.dishApiService.findByDishId(dishId);

        return new DishDeletionStatusVo(
            deletedDish.getTitle(),
            deletedDish.isSoftDeleted()
        );
    }

    /**
     * @description confirms creating a new dish
     * @param encodedDishIdVo encoded dish id with its provider name
     * @returns domain dish entity
     */
    async confirmCreating(encodedDishIdVo: EncodedDishIdVo): Promise<DishDetailsVo> {
        const encodedDishId = encodedDishIdVo.getValue();
        const id = encodedDishIdVo.getDishId();
        const dish = await this.dishApiService.findByDishId(id);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        await this.dishApiService.unsetSoftAddedForDish(id);

        const addedDish = await this.dishApiService.findByDishId(id);

        return DishDetailsVo.fromEntity(addedDish);
    }

    /**
     * @description Confirms new dish version
     * @param encodedDishIdVo encoded dish ID and its provider name
     * @returns domain dish entity
     */
    async confirmEditing(encodedDishIdVo: EncodedDishIdVo): Promise<DishDetailsVo> {
        const encodedDishId = encodedDishIdVo.getValue();
        const dishId = encodedDishIdVo.getDishId();
        const dish = await this.dishApiService.findByDishId(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        const softEdited = dish.getSoftEdited();

        await this.dishApiService.confirmDishEdition(dishId, softEdited);

        const updatedDish = await this.dishApiService.findByDishId(dishId);

        return DishDetailsVo.fromEntity(updatedDish);
    }

    /**
     * @description Confirms deletion of the particular dish
     * @param encodedDishIdVo encoded dish ID and its provider name
     * @returns dish deletion confirmation status along with success information
     */
    async confirmDeleting(encodedDishIdVo: EncodedDishIdVo): Promise<DishDeletionConfirmationStatusVo> {
        const encodedDishId = encodedDishIdVo.getValue();
        const dishId = encodedDishIdVo.getDishId();
        const dish = await this.dishApiService.findByDishId(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        await this.dishApiService.deleteAllComments(dishId);
        await this.dishApiService.deleteAllRatings(dishId);
        await this.dishApiService.deleteDish(dishId);

        const deletedDish = await this.dishApiService.findByDishId(dishId);
        const dishTitle = dish.getTitle();

        return new DishDeletionConfirmationStatusVo(
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
     * @param encodedDishIdVo encoded dish ID and its provider name
     * @param userLogin user login
     * @param content comment text to post
     * @returns void
     */
    async addDishComment(encodedDishIdVo: EncodedDishIdVo, userLogin: string, content: string): Promise<void> {
        const providable = this.providerRegistryService.getProvider(Provider.INT_DMT_USER);
        const dishDetailsVo = await providable.getDishDetails(encodedDishIdVo);
        const encodedDishId = encodedDishIdVo.getValue();

        if (!dishDetailsVo) {
            throw new DishNotFoundError(encodedDishId);
        }

        if (dishDetailsVo.softAdded) {
            throw new DishNotAcceptedError(encodedDishId);
        }

        if (dishDetailsVo.softDeleted) {
            throw new DishSoftDeletedError(encodedDishId);
        }

        const dishId = encodedDishIdVo.getDishId();

        await this.dishApiService.postNewComment(userLogin, content, dishId);
    }

    /**
     * @description Adds a new or update existing rating to the particular dish
     * @param encodedDishIdVo encoded dish ID and its provider name
     * @param userLogin user login
     * @param rating integer value between 0-10
     * @returns add dish rating status if is new rating or not
     */
    async addDishRating(encodedDishIdVo: EncodedDishIdVo, userLogin: string, rating: number): Promise<AddDishRatingStatusVo> {
        const providable = this.providerRegistryService.getProvider(Provider.INT_DMT_USER);
        const dishDetailsVo = await providable.getDishDetails(encodedDishIdVo);
        const encodedDishId = encodedDishIdVo.getValue();

        if (!dishDetailsVo) {
            throw new DishNotFoundError(encodedDishId);
        }

        const dishId = encodedDishIdVo.getDishId();

        const ratingEntity = await this.dishApiService.findRating(userLogin, dishId);

        if (ratingEntity) {
            await this.dishApiService.updateRating(userLogin, dishId, rating);

            return new AddDishRatingStatusVo(false);
        }

        await this.dishApiService.insertNewRating(userLogin, dishId, rating);

        return new AddDishRatingStatusVo(true);
    }
}