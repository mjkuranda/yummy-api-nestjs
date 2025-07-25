import { Injectable } from '@nestjs/common';
import { DishCacheService } from '../../../../cache/domains/dish/dish-cache.service';
import { DishAggregatorService } from './dish-aggregator.service';
import { MealType } from '../../../../../common/enums';
import { DishNotFoundError, DishNotAcceptedError, DishSoftDeletedError } from '../../errors';
import { ProviderRegistryService } from '../../../../provider-registry/provider-registry.service';
import {
    DishCommentVo,
    DishDetailsWithCacheVo,
    DishProposalsVo, DishProposalVo,
    DishRatingVo,
    DishResultsWithCacheVo, MergedSearchQueriesVo
} from '../vos';
import { DishEntity } from '../../common/entities';
import { DishDataManageable, UserDataManageable } from '../../../../provider-registry/data-manageable.interface';
import { EncodedDishIdVo } from '../../common/vos';

@Injectable()
export class DishReadService {

    private readonly dishApiService: DishDataManageable;
    private readonly userApiService: UserDataManageable;

    constructor(
        private readonly providerRegistryService: ProviderRegistryService,
        private readonly dishCacheService: DishCacheService,
        private readonly dishAggregatorService: DishAggregatorService,
    ) {
        this.dishApiService = this.providerRegistryService.getDishApiService();
        this.userApiService = this.providerRegistryService.getUserApiService();
    }

    /**
     * @description Returns dishes
     * @param providedIngredients raw ingredients, provided by user
     * @param mergedIngredients ingredients provided by user and from pantry
     * @param mealType filter dishes by meal type
     */
    async getDishes(providedIngredients: string[], mergedIngredients: string[], mealType?: MealType): Promise<DishResultsWithCacheVo> {
        const cachedResult = await this.dishCacheService.getDishes(providedIngredients);

        if (cachedResult) {
            return new DishResultsWithCacheVo(cachedResult, true);
        }

        const dishes = await this.dishAggregatorService.aggregateDishResults(mergedIngredients, mealType);
        await this.dishCacheService.setDishes(providedIngredients, dishes);

        return new DishResultsWithCacheVo(dishes, false);
    }

    /**
     * @description Returns detailed dish
     * @param encodedDishIdVo encoded dish ID and its provider name
     */
    async getDishDetails(encodedDishIdVo: EncodedDishIdVo): Promise<DishDetailsWithCacheVo> {
        const provider = encodedDishIdVo.getProvider();

        const providable = this.providerRegistryService.getProvider(provider);
        const cachedDish = await this.dishCacheService.getDishDetails(encodedDishIdVo);

        if (cachedDish) {
            return new DishDetailsWithCacheVo(cachedDish, true);
        }

        const dishDetails = await providable.getDishDetails(encodedDishIdVo);
        const encodedDishId = encodedDishIdVo.getValue();

        if (!dishDetails) {
            throw new DishNotFoundError(encodedDishId);
        }

        if (dishDetails.softAdded) {
            throw new DishNotAcceptedError(encodedDishId);
        }

        if (dishDetails.softDeleted) {
            throw new DishSoftDeletedError(encodedDishId);
        }

        await this.dishCacheService.setDishDetails(encodedDishIdVo, dishDetails);

        return new DishDetailsWithCacheVo(dishDetails, false);
    }

    /**
     * @description Returns dish proposals for a particular user
     * @param userLogin user login
     */
    async getDishProposals(userLogin: string): Promise<DishProposalVo[]> {
        // TODO: Consider creating CRON to create recommendation for a particular user
        const userSearchQueryEntities = await this.userApiService.findAllRecentQueries(userLogin);
        const mergedSearchQueries = MergedSearchQueriesVo.fromEntities(userSearchQueryEntities);
        const ingredients = mergedSearchQueries.getIngredients();

        const dishes = await this.dishAggregatorService.aggregateDishResults(ingredients);
        const proposal = DishProposalsVo.fromDishResultVos(dishes, mergedSearchQueries);

        return proposal.getTopTenProposals();
    }

    /**
     * @description Returns all dishes with softAdded property set to true
     * @returns dish entities which are soft-added
     */
    async getDishesWithSoftAdded(): Promise<DishEntity[]> {
        return await this.dishApiService.getDishesWithSoftAdded();
    }

    /**
     * @description Returns all dishes with softEdited property
     * @returns dish entities which are edited
     */
    async getDishesWithSoftEdited(): Promise<DishEntity[]> {
        return await this.dishApiService.getDishesWithSoftEdited();
    }

    /**
     * @description Returns all dishes with softDeleted property set to true
     * @returns dish entities which are soft-deleted
     */
    async getDishesWithSoftDeleted(): Promise<DishEntity[]> {
        return await this.dishApiService.getDishesWithSoftDeleted();
    }

    /**
     * @description Returns all comments for a particular dish
     * @param encodedDishIdVo encoded dish ID and its provider name
     * @returns dish entity and list of all comments
     */
    async getDishComments(encodedDishIdVo: EncodedDishIdVo): Promise<DishCommentVo[]> {
        const encodedDishId = encodedDishIdVo.getValue();
        const dishId = encodedDishIdVo.getDishId();

        const dish = await this.dishApiService.findByDishId(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        const comments = await this.dishApiService.getAllComments(dishId);

        return DishCommentVo.fromEntities(encodedDishId, dish, comments);
    }

    /**
     * @description Returns dish rating
     * @param encodedDishIdVo encoded dish ID and its provider name
     * @returns dish entity and information about rating and how many user rated
     */
    async getDishRating(encodedDishIdVo: EncodedDishIdVo): Promise<DishRatingVo> {
        const encodedDishId = encodedDishIdVo.getValue();
        const dishId = encodedDishIdVo.getDishId();
        const dish = await this.dishApiService.findByDishId(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        const dishRating = await this.dishApiService.getAverageRatingForDish(dishId);

        return new DishRatingVo(
            dish,
            dishRating.getAverageRating(),
            dishRating.getRatingCount()
        );
    }

    /**
     * @description Returns true if exists a dish with a particular encoded ID
     * @param encodedDishIdVo encoded dish id and its provider name
     * @deprecated
     */
    async hasDish(encodedDishIdVo: EncodedDishIdVo): Promise<boolean> {
        const isCached = await this.dishCacheService.hasDish(encodedDishIdVo);

        if (isCached) {
            return true;
        }

        const provider = encodedDishIdVo.getProvider();

        const providable = this.providerRegistryService.getProvider(provider);
        const dishDetails = await providable.getDishDetails(encodedDishIdVo);

        if (dishDetails) {
            await this.dishCacheService.setDishDetails(encodedDishIdVo, dishDetails);

            return true;
        }

        return false;
    }
}