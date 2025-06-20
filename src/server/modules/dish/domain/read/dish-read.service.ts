import { Injectable } from '@nestjs/common';
import { DishCacheService } from '../../../cache/dish/dish-cache.service';
import { DishAggregatorService } from './dish-aggregator.service';
import { MealType } from '../../../../common/enums';
import { DishNotFoundError, DishNotAcceptedError, DishSoftDeletedError } from '../../../../errors/domain';
import { ProviderRegistryService } from '../../../provider-registry/provider-registry.service';
import {
    DishCommentValueObject,
    DishDetailsWithCacheValueObject,
    DishProposalsValueObject, DishProposalValueObject,
    DishRatingValueObject,
    DishResultsWithCacheValueObject, MergedSearchQueriesValueObject
} from './value-objects';
import { DishEntity } from '../common/entities';
import { DishRepository } from '../dish.repository';
import { EncodedDishIdValueObject } from '../common/value-objects';
import { DishCommentRepository, DishRatingRepository, UserSearchQueryRepository } from '../common/repositories';

@Injectable()
export class DishReadService {

    private readonly dishRepository: DishRepository;
    private readonly dishCommentRepository: DishCommentRepository;
    private readonly dishRatingRepository: DishRatingRepository;
    private readonly userSearchQueryRepository: UserSearchQueryRepository;

    constructor(
        private readonly providerRegistryService: ProviderRegistryService,
        private readonly dishCacheService: DishCacheService,
        private readonly dishAggregatorService: DishAggregatorService,
    ) {
        this.dishRepository = this.providerRegistryService.getDishRepository();
        this.dishCommentRepository = this.providerRegistryService.getDishCommentRepository();
        this.dishRatingRepository = this.providerRegistryService.getDishRatingRepository();
        this.userSearchQueryRepository = this.providerRegistryService.getUserSearchQueryRepository();
    }

    /**
     * @description Returns dishes
     * @param providedIngredients raw ingredients, provided by user
     * @param mergedIngredients ingredients provided by user and from pantry
     * @param mealType filter dishes by meal type
     */
    async getDishes(providedIngredients: string[], mergedIngredients: string[], mealType?: MealType): Promise<DishResultsWithCacheValueObject> {
        const cachedResult = await this.dishCacheService.getDishes(providedIngredients);

        if (cachedResult) {
            return new DishResultsWithCacheValueObject(cachedResult, true);
        }

        const dishes = await this.dishAggregatorService.aggregateDishResults(mergedIngredients, mealType);
        await this.dishCacheService.setDishes(providedIngredients, dishes);

        return new DishResultsWithCacheValueObject(dishes, false);
    }

    /**
     * @description Returns detailed dish
     * @param encodedDishId encoded dish ID and its provider name
     */
    async getDishDetails(encodedDishId: EncodedDishIdValueObject): Promise<DishDetailsWithCacheValueObject> {
        const provider = encodedDishId.getProvider();

        const providable = this.providerRegistryService.getProvider(provider);
        const cachedDish = await this.dishCacheService.getDishDetails(encodedDishId);

        if (cachedDish) {
            return new DishDetailsWithCacheValueObject(cachedDish, true);
        }

        const dishDetails = await providable.getDishDetails(encodedDishId);

        if (!dishDetails) {
            throw new DishNotFoundError(encodedDishId);
        }

        if (dishDetails.softAdded) {
            throw new DishNotAcceptedError(encodedDishId);
        }

        if (dishDetails.softDeleted) {
            throw new DishSoftDeletedError(encodedDishId);
        }

        await this.dishCacheService.setDishDetails(encodedDishId, dishDetails);

        return new DishDetailsWithCacheValueObject(dishDetails, false);
    }

    /**
     * @description Returns dish proposals for a particular user
     * @param userLogin user login
     */
    async getDishProposals(userLogin: string): Promise<DishProposalValueObject[]> {
        // TODO: Consider creating CRON to create recommendation for a particular user
        const userSearchQueryEntities = await this.userSearchQueryRepository.findAllRecentQueries(userLogin);
        const mergedSearchQueries = MergedSearchQueriesValueObject.fromEntities(userSearchQueryEntities);
        const ingredients = mergedSearchQueries.getIngredients();

        const dishes = await this.dishAggregatorService.aggregateDishResults(ingredients);
        const proposal = DishProposalsValueObject.fromDishResultVos(dishes, mergedSearchQueries);

        return proposal.getTopTenProposals();
    }

    /**
     * @description Returns all dishes with softAdded property set to true
     * @returns dish entities which are soft-added
     */
    async getDishesWithSoftAdded(): Promise<DishEntity[]> {
        return await this.dishRepository.getDishesWithSoftAdded();
    }

    /**
     * @description Returns all dishes with softEdited property
     * @returns dish entities which are edited
     */
    async getDishesWithSoftEdited(): Promise<DishEntity[]> {
        return await this.dishRepository.getDishesWithSoftEdited();
    }

    /**
     * @description Returns all dishes with softDeleted property set to true
     * @returns dish entities which are soft-deleted
     */
    async getDishesWithSoftDeleted(): Promise<DishEntity[]> {
        return await this.dishRepository.getDishesWithSoftDeleted();
    }

    /**
     * @description Returns all comments for a particular dish
     * @param encodedDishId encoded dish ID and its provider name
     * @returns dish entity and list of all comments
     */
    async getDishComments(encodedDishId: EncodedDishIdValueObject): Promise<DishCommentValueObject[]> {
        const dishId = encodedDishId.getDishId();

        const dish = await this.dishRepository.findById(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        const comments = await this.dishCommentRepository.getAll(dishId);

        return DishCommentValueObject.fromEntities(dish, comments);
    }

    /**
     * @description Returns dish rating
     * @param encodedDishId encoded dish ID and its provider name
     * @returns dish entity and information about rating and how many user rated
     */
    async getDishRating(encodedDishId: EncodedDishIdValueObject): Promise<DishRatingValueObject> {
        const dishId = encodedDishId.getDishId();
        const dish = await this.dishRepository.findById(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        const dishRating = await this.dishRatingRepository.getAverageRatingForDish(dishId);

        return new DishRatingValueObject(
            dish,
            dishRating.getAverageRating(),
            dishRating.getRatingCount()
        );
    }

    /**
     * @description Returns true if exists a dish with a particular encoded ID
     * @param encodedDishId encoded dish id and its provider name
     * @deprecated
     */
    async hasDish(encodedDishId: EncodedDishIdValueObject): Promise<boolean> {
        const isCached = await this.dishCacheService.hasDish(encodedDishId);

        if (isCached) {
            return true;
        }

        const provider = encodedDishId.getProvider();

        const providable = this.providerRegistryService.getProvider(provider);
        const dishDetails = await providable.getDishDetails(encodedDishId);

        if (dishDetails) {
            await this.dishCacheService.setDishDetails(encodedDishId, dishDetails);

            return true;
        }

        return false;
    }
}