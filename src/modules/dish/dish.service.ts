import { isValidObjectId } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { DishDocument } from '../../mongodb/documents/dish.document';
import { CreateDishCommentBody, CreateDishDto, CreateDishRatingBody, DishEditDto } from './dish.dto';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { LoggerService } from '../logger/logger.service';
import { RedisService } from '../redis/redis.service';
import { UserDto } from '../user/user.dto';
import { DishRepository } from '../../mongodb/repositories/dish.repository';
import { MealType } from '../../common/enums';
import { DetailedDish, DishRating, MergedSearchQueries, ProposedDish, RatedDish } from './dish.types';
import {
    getQueryWithIngredientsAndDishType,
    mergeSearchQueries,
    proceedDishDocumentToDishDetails,
    proceedRatedDishesToProposedDishes
} from './dish.utils';
import { HOUR } from '../../constants/times.constant';
import { IngredientService } from '../ingredient/ingredient.service';
import { IngredientType, DishIngredient, DishIngredientWithoutImage } from '../ingredient/ingredient.types';
import { UserAccessTokenPayload } from '../jwt-manager/jwt-manager.types';
import { SearchQueryRepository } from '../../mongodb/repositories/search-query.repository';
import { SearchQueryDocument } from '../../mongodb/documents/search-query.document';
import { ContextString } from '../../common/types';
import { DishCommentRepository } from '../../mongodb/repositories/dish-comment.repository';
import { DishCommentDocument } from '../../mongodb/documents/dish-comment.document';
import { DishRatingRepository } from '../../mongodb/repositories/dish-rating.repository';
import { DishRatingDocument } from '../../mongodb/documents/dish-rating.document';
import { sortDescendingRelevance } from '../../common/helpers';
import { ForbiddenException } from '../../exceptions/forbidden-exception';
import { ExternalApiService } from '../api/external-api.service';
import { getFulfilledPromiseResults } from '../../utils';

@Injectable()
export class DishService {

    constructor(
        private dishRepository: DishRepository,
        private dishCommentRepository: DishCommentRepository,
        private dishRatingRepository: DishRatingRepository,
        private searchQueryRepository: SearchQueryRepository,
        private redisService: RedisService,
        private loggerService: LoggerService,
        private ingredientService: IngredientService,
        private externalApiService: ExternalApiService
    ) {}

    async create(createDishDto: CreateDishDto<DishIngredientWithoutImage>, user: UserDto): Promise<DishDocument> {
        const ingredients = await this.ingredientService.wrapIngredientsWithImages(createDishDto.ingredients);

        const createdDish = await this.dishRepository.create({
            ...createDishDto,
            ingredients,
            author: user.login,
            posted: Date.now(),
            provider: 'yummy',
            softAdded: true
        });

        const title = createDishDto.title;
        const ingredientCount = createDishDto.ingredients.length;
        const imageUrlDescription = createDishDto.imageUrl
            ? `"${createDishDto.imageUrl}" image url`
            : 'no image';
        const context = 'DishService/create';
        const message = `New dish "${title}", having ${ingredientCount} ingredients and with ${imageUrlDescription} has been created by ${user.login}.`;

        this.loggerService.info(context, message);

        return createdDish;
    }

    async confirmCreating(id: string, user: UserDto): Promise<DishDocument> {
        const context = 'DishService/confirmCreating';

        if (!isValidObjectId(id)) {
            const message = `Provided "${id}" that is not a correct MongoDB id.`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const dish = await this.dishRepository.findById(id) as DishDocument;

        if (!dish) {
            const message = `Cannot find a dish with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        await this.dishRepository.updateOne({ _id: dish._id }, {
            $unset: {
                softAdded: true
            }
        });
        const addedDish = await this.dishRepository.findById(dish._id) as DishDocument;
        await this.redisService.set<DishDocument>(addedDish, 'dish');
        this.loggerService.info(context, `Cached a dish with "${dish._id}" id.`);

        this.loggerService.info(context, `Dish with id "${dish._id}" (titled: "${dish.title}") has been confirmed adding by "${user.login}" user.`);

        return addedDish;
    }

    async edit(id: string, dishEditDto: DishEditDto<DishIngredient>): Promise<DishDocument> {
        const context = 'DishService/edit';

        if (!isValidObjectId(id)) {
            const message = `Provided "${id}" that is not a correct MongoDB id.`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const dish = await this.dishRepository.findById(id) as DishDocument;

        if (!dish) {
            const message = `Cannot find a dish with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        await this.dishRepository.updateOne({ _id: dish._id }, {
            $set: {
                softEdited: dishEditDto
            }
        });
        const editedDish = await this.dishRepository.findById(dish._id) as DishDocument;
        this.loggerService.info(context, `Dish with id "${dish._id}" (titled: "${dish.title}") has been edited.`);

        return editedDish;
    }

    async confirmEditing(id: string, user: UserDto): Promise<DishDocument> {
        const context = 'DishService/confirmEditing';

        if (!isValidObjectId(id)) {
            const message = `Provided "${id}" that is not a correct MongoDB id.`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const dish = await this.dishRepository.findById(id) as DishDocument;

        if (!dish) {
            const message = `Cannot find a dish with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        await this.dishRepository.updateOne({ _id: id }, {
            $unset: { softEdited: {}},
            $set: { ...dish.softEdited }
        });
        const updatedDish = await this.dishRepository.findById(id) as DishDocument;
        await this.redisService.set<DishDocument>(updatedDish, 'dish');
        this.loggerService.info(context, `Cached a dish with "${dish._id}" id.`);

        this.loggerService.info(context, `Dish with id "${dish._id}" (titled: "${dish.title}") has been confirmed editing by "${user.login}" user.`);

        return updatedDish as DishDocument;
    }

    async delete(id: string): Promise<DishDocument> {
        const context = 'DishService/delete';

        if (!isValidObjectId(id)) {
            const message = `Provided "${id}" that is not a correct MongoDB id.`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const dish = await this.dishRepository.findById(id) as DishDocument;

        if (!dish) {
            const message = `Cannot find a dish with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        await this.redisService.deleteDish(dish._id);
        await this.dishRepository.updateOne({ _id: dish._id }, {
            $set: {
                softDeleted: true
            }
        });
        const deletedDish = await this.dishRepository.findById(dish._id) as DishDocument;
        this.loggerService.info(context, `Dish with id "${dish._id}" (titled: "${dish.title}") has been marked as soft deleted.`);

        return deletedDish;
    }

    async confirmDeleting(id: string, user: UserDto): Promise<DishDocument | null> {
        const context = 'DishService/confirmDeleting';

        if (!isValidObjectId(id)) {
            const message = `Provided "${id}" that is not a correct MongoDB id.`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const dish = await this.dishRepository.findById(id) as DishDocument;

        if (!dish) {
            const message = `Cannot find a dish with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        await this.redisService.deleteDish(dish._id);
        await this.dishCommentRepository.deleteAll(dish._id);
        await this.dishRatingRepository.deleteAll(dish._id);
        await this.dishRepository.delete(dish._id);
        const deletedDish = await this.dishRepository.findById(dish._id) as DishDocument; // FIXME: Is it null always? It's just after deletion O.O

        this.loggerService.info(context, `Dish with id "${dish._id}" (titled: "${dish.title}") has been confirmed deleting by "${user.login}" user.`);

        return deletedDish;
    }

    async getDishDetails(id: string): Promise<DetailedDish> {
        const context = 'DishService/getDishDetails';

        if (!id) {
            throw new BadRequestException(context, 'Not provided id param.');
        }

        const cachedDish: DetailedDish = await this.redisService.getDishDetails(id);

        if (cachedDish) {
            this.loggerService.info(context, `Found in cache a dish with id "${id}".`);

            return cachedDish;
        }

        if (isValidObjectId(id)) {
            const dishDocument: DishDocument = await this.dishRepository.findById(id);

            if (dishDocument) {
                if (dishDocument.softAdded) {
                    throw new ForbiddenException(context, `Dish with "${id}" id was not confirmed by admin. Therefore, it is impossible to see its content.`);
                }

                if (dishDocument.softDeleted) {
                    throw new ForbiddenException(context, `Dish with "${id}" id is labeled to be deleted. Therefore, it is impossible to see its content.`);
                }

                const dishDetails: DetailedDish = proceedDishDocumentToDishDetails(dishDocument);
                await this.redisService.saveDishDetails(id, dishDetails);
                this.loggerService.info(context, `Found in local database a dish with id "${id}" and cached.`);

                return dishDetails;
            }
        }

        const datasets = await this.getDatasets<DetailedDish>(...this.externalApiService.getDishDetails(id));

        const filteredDish: DetailedDish = datasets.find(dish => dish !== null);

        if (filteredDish) {
            await this.redisService.saveDishDetails(id, filteredDish);
            this.loggerService.info(context, `Found in external database a dish with id "${id}" and cached.`);

            return filteredDish;
        }

        throw new NotFoundException(context, `Dish with "${id}" does not exist in any integrated API.`);
    }

    async find(id: string): Promise<DishDocument> {
        const context = 'DishService/find';

        if (!isValidObjectId(id)) {
            const message = `Provided "${id}" that is not a correct MongoDB id.`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const key = this.redisService.encodeKey({ _id: id }, 'dish');
        const cachedDish = await this.redisService.get<DishDocument>(key) as DishDocument;

        if (cachedDish) {
            if (cachedDish.softDeleted) {
                const message = `Cannot find a dish with "${id}" id.`;
                this.loggerService.error(context, message);

                throw new NotFoundException(context, message);
            }

            this.loggerService.info(context, `Fetched a dish with "${cachedDish._id}" id from cache.`);

            return cachedDish;
        }

        const dish = await this.dishRepository.findOne({
            _id: id,
            softAdded: { $exists: false },
            softDeleted: { $exists: false }
        }) as DishDocument;

        if (!dish) {
            const message = `Cannot find a dish with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        this.loggerService.info(context, `Found dish with "${id}" (titled: "${dish.title}") id.`);
        await this.redisService.set(dish, 'dish');
        this.loggerService.info(context, `Cached a dish with "${id}" (titled: "${dish.title}") id.`);

        return dish;
    }

    async findAll(): Promise<DishDocument[]> {
        const dishes = (await this.dishRepository.findAll({ softDeleted: { $exists: false }})) as DishDocument[];
        const message = `Found ${dishes.length} dishes.`;

        this.loggerService.info('DishService/findAll', message);

        return dishes;
    }

    async getDishes(ings: IngredientType[], type: MealType): Promise<RatedDish[]> {
        const filteredIngredients = this.ingredientService.filterIngredients(ings);
        const query = getQueryWithIngredientsAndDishType(filteredIngredients, type);
        const cachedResult = await this.redisService.getDishResult('merged', query);
        const context = 'DishService/getDishes';

        if (cachedResult) {
            this.loggerService.info(context, `Found cached result "${query}" containing ${cachedResult.length} dishes.`);

            return cachedResult;
        }

        const ingredients = [...filteredIngredients, ...this.ingredientService.getAllPantryIngredients()];

        const datasets = await this.getDatasets(this.dishRepository.getDishes(ingredients), ...this.externalApiService.getDishes(ingredients, type));

        const dishes: RatedDish[] = datasets.flat().filter(dish => dish.relevance > 0).sort(sortDescendingRelevance);
        await this.redisService.saveDishResult('merged', query, dishes, 12 * HOUR);
        this.loggerService.info(context, `Cached result containing ${dishes.length} dishes, defined for query "${query}".`);

        return dishes;
    }

    async getDishProposal(user: UserAccessTokenPayload) {
        const dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - 14);

        const searchQueries: SearchQueryDocument[] = await this.searchQueryRepository.findAll({ date: { $gte: dateFilter }, login: user.login });
        const mergedSearchQueries: MergedSearchQueries = mergeSearchQueries(searchQueries);
        const ingredientsList = Object.keys(mergedSearchQueries);
        const datasets = await this.getDatasets(this.dishRepository.getDishes(ingredientsList), ...this.externalApiService.getDishes(ingredientsList));
        const dishes: RatedDish[] = datasets.flat().sort(sortDescendingRelevance);
        const proposedDishes: ProposedDish[] = proceedRatedDishesToProposedDishes(dishes, mergedSearchQueries);

        this.loggerService.info('DishService/getDishProposal', `Generated ${proposedDishes.length} dish proposal${proposedDishes.length > 1 ? 's' : ''}.`);

        return proposedDishes
            .filter(dish => dish.recommendationPoints > 0)
            .filter((dish, idx) => idx < 10);
    }

    async addDishProposal(user: UserAccessTokenPayload, ingredients: string[]) {
        const filteredIngredients = this.ingredientService.filterIngredients(ingredients);
        await this.searchQueryRepository.create({ ingredients: filteredIngredients, date: new Date(), login: user.login });
        this.loggerService.info('DishService/addDishProposal', `Added search query for user ${user.login}.`);
    }

    async getDishesSoftAdded(): Promise<DishDocument[]> {
        return await this.dishRepository.findAll({ softAdded: { $eq: true }});
    }

    async getDishesSoftEdited(): Promise<DishDocument[]> {
        return await this.dishRepository.findAll({ softEdited: { $exists: true }});
    }

    async getDishesSoftDeleted(): Promise<DishDocument[]> {
        return await this.dishRepository.findAll({ softDeleted: { $eq: true }});
    }

    async hasDish(dishId: string): Promise<boolean> {
        const context: ContextString = 'DishService/hasDish';
        const isSaved = await this.redisService.hasDish(dishId);

        if (isSaved) {
            return true;
        }

        // NOTE: When it is usual request after fetching details, it should be found within cache
        // Checking existence of the dish
        if (isValidObjectId(dishId)) {
            const dish = await this.dishRepository.findById(dishId);

            if (dish) {
                return true;
            }
        } else {
            const datasets = await this.getDatasets(...this.externalApiService.getDishDetails(dishId));

            const filteredDish: DetailedDish = datasets.find(dish => dish !== null);

            if (filteredDish) {
                await this.redisService.saveDishDetails(dishId, filteredDish);
                this.loggerService.info(context, `Cached a dish with id "${dishId}".`);

                return true;
            }
        }

        return false;
    }

    async getComments(dishId: string): Promise<DishCommentDocument[]> {
        const context: ContextString = 'DishService/getComments';
        const hasDish = await this.hasDish(dishId);

        if (!hasDish) {
            const message = 'Dish with provided ID does not exist.';
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        const comments = await this.dishCommentRepository.findAll({ dishId: dishId });

        this.loggerService.info(context, `Found ${comments.length} comments for "${dishId}" dish.`);

        return comments;
    }

    async addComment(createCommentBody: CreateDishCommentBody, user: string): Promise<void> {
        const context: ContextString = 'DishService/addComment';
        const hasDish = await this.hasDish(createCommentBody.dishId);

        if (!hasDish) {
            const message = 'Dish with provided ID does not exist.';
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        await this.dishCommentRepository.create({ ...createCommentBody, user, posted: Date.now() });
        this.loggerService.info(context, `Successfully added a new comment to "${createCommentBody.dishId}" dish by "${user}" user.`);
    }

    async calculateRating(dishId: string): Promise<DishRating> {
        const context: ContextString = 'DishService/calculateRating';
        const hasDish = await this.hasDish(dishId);

        if (!hasDish) {
            const message = 'Dish with provided ID does not exist.';
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        this.loggerService.info(context, `Calculated rating for dish "${dishId}".`);

        return await this.dishRatingRepository.getAverageRatingForDish(dishId);
    }

    async addRating(createRatingBody: CreateDishRatingBody, user: string): Promise<DishRatingDocument> {
        const context: ContextString = 'DishService/addRating';
        const hasDish = await this.hasDish(createRatingBody.dishId);

        if (!hasDish) {
            const message = 'Dish with provided ID does not exist.';
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        const rating = await this.dishRatingRepository.findOne({
            dishId: createRatingBody.dishId,
            user
        });

        if (rating) {
            this.loggerService.info(context, `Successfully changed a rating for "${createRatingBody.dishId}" dish by "${user}" user.`);

            return await this.dishRatingRepository.updateAndReturnDocument({
                dishId: createRatingBody.dishId,
                user
            },
            {
                ...createRatingBody,
                posted: Date.now()
            });
        }

        this.loggerService.info(context, `Successfully added a new rating for "${createRatingBody.dishId}" dish by "${user}" user.`);

        return await this.dishRatingRepository.create({ ...createRatingBody, user, posted: Date.now() });
    }

    private getDatasets<T>(...datasets: Promise<T>[]): Promise<T[]> {
        return getFulfilledPromiseResults<T>(datasets);
    }
}