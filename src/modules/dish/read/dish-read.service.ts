import { Injectable } from '@nestjs/common';
import { DishRating, MergedSearchQueries, ProposedDish } from '../dish.types';
import { DishDocument } from '../../../mongodb/documents/dish.document';
import { DishRepository } from '../../../mongodb/repositories/dish.repository';
import { DishCacheService } from '../../cache/dish/dish-cache.service';
import { EncodedDishId } from '../../../common/types';
import { DishAggregatorService } from './dish-aggregator.service';
import { MealType } from '../../../common/enums';
import { DishIdObfuscator } from '../../../common/helpers/dish-id-obfuscator.helper';
import { proceedRatedDishesToProposedDishes } from '../dish.utils';
import { DishNotFoundError, DishNotAcceptedError, DishSoftDeletedError, InvalidDishIdError } from '../../../errors/domain';
import { GetDishDetailsResult, GetDishesResult } from './dish-read.types';
import { DishCommentDocument } from '../../../mongodb/documents/dish-comment.document';
import { DishCommentRepository } from '../../../mongodb/repositories/dish-comment.repository';
import { DishRatingRepository } from '../../../mongodb/repositories/dish-rating.repository';
import { ProviderRegistryService } from '../../provider/provider-registry.service';

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
        const decoded = DishIdObfuscator.decode(encodedDishId);

        if (!decoded) {
            throw new InvalidDishIdError(encodedDishId);
        }

        const { providerName, dishId } = decoded;
        const provider = this.providerRegistryService.getProvider(providerName);
        const cachedDish = await this.dishCacheService.getDishDetails(encodedDishId);

        if (cachedDish) {
            return { dish: cachedDish, fromCache: true };
        }

        const dishDetailsWithMetadata = await provider.getDishDetails(dishId);

        if (!dishDetailsWithMetadata) {
            throw new DishNotFoundError(dishId);
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
     */
    async getDishesWithSoftAdded(): Promise<DishDocument[]> {
        return await this.dishRepository.getDishesWithSoftAdded();
    }

    /**
     * @description Returns all dishes with softEdited property
     */
    async getDishesWithSoftEdited(): Promise<DishDocument[]> {
        return await this.dishRepository.getDishesWithSoftEdited();
    }

    /**
     * @description Returns all dishes with softDeleted property set to true
     */
    async getDishesWithSoftDeleted(): Promise<DishDocument[]> {
        return await this.dishRepository.getDishesWithSoftDeleted();
    }

    /**
     * @description Returns all comments for a particular dish
     * @param encodedDishId encoded dish ID and its provider name
     */
    async getDishComments(encodedDishId: EncodedDishId): Promise<DishCommentDocument[]> {
        const decoded = DishIdObfuscator.decode(encodedDishId);

        if (!decoded) {
            throw new InvalidDishIdError(encodedDishId);
        }

        const { dishId } = decoded;

        const dish = await this.dishRepository.findById(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        return await this.dishCommentRepository.findAll({ dishId });
    }

    async getDishRating(encodedDishId: EncodedDishId): Promise<DishRating> {
        const decoded = DishIdObfuscator.decode(encodedDishId);

        if (!decoded) {
            throw new InvalidDishIdError(encodedDishId);
        }

        const { dishId } = decoded;
        const dish = await this.dishRepository.findById(dishId);

        if (!dish) {
            throw new DishNotFoundError(encodedDishId);
        }

        return await this.dishRatingRepository.getAverageRatingForDish(dishId);
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

        const { providerName, dishId } = DishIdObfuscator.decode(encodedDishId);
        const provider = this.providerRegistryService.getProvider(providerName);
        const dishDetailsWithMetadata = await provider.getDishDetails(dishId);

        if (dishDetailsWithMetadata) {
            const { dishDetails } = dishDetailsWithMetadata;
            await this.dishCacheService.setDishDetails(encodedDishId, dishDetails);

            return true;
        }

        return false;
    }
}