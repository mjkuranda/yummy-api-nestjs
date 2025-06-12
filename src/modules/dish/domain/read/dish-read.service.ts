import { Injectable } from '@nestjs/common';
import { MergedSearchQueries, ProposedDish } from '../../dish.types';
import { DishRepository } from '../../../../mongodb/repositories/dish.repository';
import { DishCacheService } from '../../../cache/dish/dish-cache.service';
import { DishAggregatorService } from './dish-aggregator.service';
import { MealType } from '../../../../common/enums';
import { proceedRatedDishesToProposedDishes } from '../../dish.utils';
import { DishNotFoundError, DishNotAcceptedError, DishSoftDeletedError } from '../../../../errors/domain';
import { GetDishDetailsResult, GetDishesResult } from './dish-read.types';
import { DishCommentRepository } from '../../../../mongodb/repositories/dish-comment.repository';
import { DishRatingRepository } from '../../../../mongodb/repositories/dish-rating.repository';
import { ProviderRegistryService } from '../../../provider/provider-registry.service';
import { EncodedDishId } from '../common/encoded-dish-id.value-object';
import { DishRatingsValueObject, DishCommentsValueObject } from './value-objects';
import { DishEntity } from '../common/entities';

@Injectable()
export class DishReadService {

    private dishRepository: DishRepository;

    constructor(
        private readonly providerRegistryService: ProviderRegistryService,
        private readonly dishCacheService: DishCacheService,
        private readonly dishAggregatorService: DishAggregatorService,
        private readonly dishCommentRepository: DishCommentRepository,
        private readonly dishRatingRepository: DishRatingRepository
    ) {
        this.dishRepository = this.providerRegistryService.getDishRepository();
    }

    /**
     * @description Returns dishes
     * @param providedIngredients raw ingredients, provided by user
     * @param mergedIngredients ingredients provided by user and from pantry
     * @param mealType filter dishes by meal type
     */
    async getDishes(providedIngredients: string[], mergedIngredients: string[], mealType?: MealType): Promise<GetDishesResult> {
        const cachedResult = await this.dishCacheService.getDishes(providedIngredients);

        if (cachedResult) {
            return { dishes: cachedResult, fromCache: true };
        }

        const dishes = await this.dishAggregatorService.aggregateRatedDishes(mergedIngredients, mealType);
        await this.dishCacheService.setDishes(providedIngredients, dishes);

        return { dishes, fromCache: false };
    }

    /**
     * @description Returns detailed dish
     * @param encodedDishId encoded dish ID and its provider name
     */
    async getDishDetails(encodedDishId: EncodedDishId): Promise<GetDishDetailsResult> {
        const provider = encodedDishId.getProvider();

        const providable = this.providerRegistryService.getProvider(provider);
        const cachedDish = await this.dishCacheService.getDishDetails(encodedDishId);

        if (cachedDish) {
            return { dish: cachedDish, fromCache: true };
        }

        const dishDetailsWithMetadata = await providable.getDishDetails(encodedDishId);

        if (!dishDetailsWithMetadata) {
            throw new DishNotFoundError(encodedDishId);
        }

        const { dishDetails, metadata } = dishDetailsWithMetadata;

        if (metadata.softAdded) {
            throw new DishNotAcceptedError(encodedDishId);
        }

        if (metadata.softDeleted) {
            throw new DishSoftDeletedError(encodedDishId);
        }

        await this.dishCacheService.setDishDetails(encodedDishId, dishDetails);

        return { dish: dishDetails, fromCache: false };
    }

    /**
     * @description Returns dish proposals for a particular user
     * @param ingredients list of recent-used ingredients in user queries
     * @param mergedSearchQueries search queries with rated ingredients
     */
    async getDishProposals(ingredients: string[], mergedSearchQueries: MergedSearchQueries): Promise<ProposedDish[]> {
        const dishes = await this.dishAggregatorService.aggregateRatedDishes(ingredients);
        const proposedDishes: ProposedDish[] = proceedRatedDishesToProposedDishes(dishes, mergedSearchQueries);

        return proposedDishes
            .filter((dish, idx) => idx < 10);
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
    async getDishComments(encodedDishId: EncodedDishId): Promise<DishCommentsValueObject> {
        const dishId = encodedDishId.getDishId();

        const dish = await this.dishRepository.findById(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        const comments = await this.dishCommentRepository.getAll(dishId);

        return new DishCommentsValueObject(dish, comments);
    }

    /**
     * @description Returns dish rating
     * @param encodedDishId encoded dish ID and its provider name
     * @returns dish entity and information about rating and how many user rated
     */
    async getDishRating(encodedDishId: EncodedDishId): Promise<DishRatingsValueObject> {
        const dishId = encodedDishId.getDishId();
        const dish = await this.dishRepository.findById(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        const dishRating = await this.dishRatingRepository.getAverageRatingForDish(dishId);

        return new DishRatingsValueObject(
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
    async hasDish(encodedDishId: EncodedDishId): Promise<boolean> {
        const isCached = await this.dishCacheService.hasDish(encodedDishId);

        if (isCached) {
            return true;
        }

        const provider = encodedDishId.getProvider();

        const providable = this.providerRegistryService.getProvider(provider);
        const dishDetailsWithMetadata = await providable.getDishDetails(encodedDishId);

        if (dishDetailsWithMetadata) {
            const { dishDetails } = dishDetailsWithMetadata;
            await this.dishCacheService.setDishDetails(encodedDishId, dishDetails);

            return true;
        }

        return false;
    }
}