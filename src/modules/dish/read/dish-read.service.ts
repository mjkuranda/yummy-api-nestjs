import { Injectable } from '@nestjs/common';
import { DishSourceRegistryService } from '../source/dish-source-registry.service';
import { DetailedDish, MergedSearchQueries, ProposedDish, RatedDish } from '../dish.types';
import { DishDocument } from '../../../mongodb/documents/dish.document';
import { DishRepository } from '../../../mongodb/repositories/dish.repository';
import { DishCacheService } from '../../cache/dish-cache.service';
import { ContextString, EncodedDishId } from '../../../common/types';
import { LoggerService } from '../../logger/logger.service';
import { DishAggregatorService } from './dish-aggregator.service';
import { MealType } from '../../../common/enums';
import { DishIdObfuscator } from '../../../common/helpers/dish-id-obfuscator.helper';
import { NotFoundException } from '../../../exceptions/not-found.exception';
import { BadRequestException } from '../../../exceptions/bad-request.exception';
import { proceedRatedDishesToProposedDishes } from '../dish.utils';

@Injectable()
export class DishReadService {

    private dishRepository: DishRepository;

    constructor(
        private readonly dishSourceRegistryService: DishSourceRegistryService,
        private readonly dishCacheService: DishCacheService,
        private readonly dishAggregatorService: DishAggregatorService,
        private readonly loggerService: LoggerService
    ) {
        this.dishRepository = this.dishSourceRegistryService.getDishRepositoryProvider();
    }

    /**
     * @description Returns dishes
     * @param providedIngredients raw ingredients, provided by user
     * @param mergedIngredients ingredients provided by user and from pantry
     * @param mealType filter dishes by meal type
     */
    async getDishes(providedIngredients: string[], mergedIngredients: string[], mealType?: MealType): Promise<RatedDish[]> {
        const context: ContextString = 'DishReadService/getDishes';
        const cachedResult = await this.dishCacheService.getDishes(providedIngredients);

        if (cachedResult) {
            this.loggerService.info(context, `Found cached dishes (${providedIngredients.join(', ')}) containing ${cachedResult.length} dishes.`);

            return cachedResult;
        }

        const dishes = await this.dishAggregatorService.aggregateRatedDishes(mergedIngredients, mealType);
        await this.dishCacheService.setDishes(providedIngredients, dishes);

        this.loggerService.info(context, `Cached result containing ${dishes.length} dishes, defined for ingredients: ${providedIngredients.join(', ')}.`);

        return dishes;
    }

    /**
     * @description Returns detailed dish
     * @param encodedDishId encoded dish ID and its provider name
     */
    async getDishDetails(encodedDishId: EncodedDishId): Promise<DetailedDish> {
        const context: ContextString = 'DishReadService/getDishDetails';
        const decoded = DishIdObfuscator.decode(encodedDishId);

        if (!decoded) {
            const message = 'Incorrect ID';

            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const { providerName, dishId } = decoded;
        const provider = this.dishSourceRegistryService.getProvider(providerName);
        const cachedDish = await this.dishCacheService.getDishDetails(encodedDishId);

        if (cachedDish) {
            this.loggerService.info(context, `Found in cache and returned dish with "${dishId}" id.`);

            return cachedDish;
        }

        try {
            const detailedDish = await provider.getDishDetails(dishId);

            if (!detailedDish) {
                throw new NotFoundException(context, `Not found dish with "${dishId}" id.`);
            }

            await this.dishCacheService.setDishDetails(encodedDishId, detailedDish);
            this.loggerService.info(context, `Found and cached dish with "${dishId}" id.`);

            return detailedDish;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * @description Returns dish proposals for a particular user
     * @param ingredients list of recent-used ingredients in user queries
     * @param mergedSearchQueries search queries with rated ingredients
     */
    async getDishProposals(ingredients: string[], mergedSearchQueries: MergedSearchQueries): Promise<ProposedDish[]> {
        const dishes = await this.dishAggregatorService.aggregateRatedDishes(ingredients);
        const proposedDishes: ProposedDish[] = proceedRatedDishesToProposedDishes(dishes, mergedSearchQueries);

        this.loggerService.info('DishService/getDishProposal', `Generated ${proposedDishes.length} dish proposal${proposedDishes.length > 1 ? 's' : ''}.`);

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
     * @description Returns true if exists a dish with a particular encoded ID
     * @param encodedDishId
     */
    async hasDish(encodedDishId: EncodedDishId): Promise<boolean> {
        const context: ContextString = 'DishReadService/hasDish';
        const isCached = await this.dishCacheService.hasDish(encodedDishId);

        if (isCached) {
            this.loggerService.info(context, `Dish "${encodedDishId}" exists and found in cache.`);

            return true;
        }

        const { providerName, dishId } = DishIdObfuscator.decode(encodedDishId);
        const provider = this.dishSourceRegistryService.getProvider(providerName);
        const dish = await provider.getDishDetails(dishId);

        if (dish) {
            await this.dishCacheService.setDishDetails(encodedDishId, dish);

            this.loggerService.info(context, `Dish ${encodedDishId} exists and cached.`);

            return true;
        }

        this.loggerService.info(context, `Dish ${encodedDishId} does not exist.`);

        return false;
    }
}