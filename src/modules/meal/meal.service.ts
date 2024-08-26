import { isValidObjectId } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { MealDocument } from '../../mongodb/documents/meal.document';
import { CreateMealCommentBody, CreateMealDto, MealEditDto } from './meal.dto';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { LoggerService } from '../logger/logger.service';
import { RedisService } from '../redis/redis.service';
import { UserDto } from '../user/user.dto';
import { MealRepository } from '../../mongodb/repositories/meal.repository';
import { MealType } from '../../common/enums';
import { DetailedMeal, MealRating, MergedSearchQueries, ProposedMeal, RatedMeal } from './meal.types';
import { SpoonacularApiService } from '../api/spoonacular/spoonacular.api.service';
import {
    getQueryWithIngredientsAndMealType,
    mergeSearchQueries,
    proceedMealDocumentToMealDetails,
    proceedRatedMealsToProposedMeals
} from './meal.utils';
import { HOUR } from '../../constants/times.constant';
import { IngredientService } from '../ingredient/ingredient.service';
import { IngredientType } from '../ingredient/ingredient.types';
import { UserAccessTokenPayload } from '../jwt-manager/jwt-manager.types';
import { SearchQueryRepository } from '../../mongodb/repositories/search-query.repository';
import { SearchQueryDocument } from '../../mongodb/documents/search-query.document';
import { ContextString } from '../../common/types';
import { MealCommentRepository } from '../../mongodb/repositories/meal-comment.repository';
import { MealCommentDocument } from '../../mongodb/documents/meal-comment.document';
import { MealRatingRepository } from '../../mongodb/repositories/meal-rating.repository';

@Injectable()
export class MealService {

    constructor(
        private mealRepository: MealRepository,
        private mealCommentRepository: MealCommentRepository,
        private mealRatingRepository: MealRatingRepository,
        private searchQueryRepository: SearchQueryRepository,
        private redisService: RedisService,
        private loggerService: LoggerService,
        private ingredientService: IngredientService,
        private spoonacularApiService: SpoonacularApiService
    ) {}

    async create(createMealDto: CreateMealDto): Promise<MealDocument> {
        const createdMeal = await this.mealRepository.create({ ...createMealDto, posted: new Date().getTime(), softAdded: true }) as MealDocument;

        const title = createMealDto.title;
        const ingredientCount = createMealDto.ingredients.length;
        const imageUrlDescription = createMealDto
            ? `"${createMealDto.imageUrl}" image url`
            : 'no image';
        const context = 'MealService/create';
        const message = `New meal "${title}", having ${ingredientCount} ingredients and with ${imageUrlDescription} has been created.`;

        this.loggerService.info(context, message);

        return createdMeal;
    }

    async confirmCreating(id: string, user: UserDto): Promise<MealDocument> {
        const context = 'MealService/confirmCreating';

        if (!isValidObjectId(id)) {
            const message = `Provided "${id}" that is not a correct MongoDB id.`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const meal = await this.mealRepository.findById(id) as MealDocument;

        if (!meal) {
            const message = `Cannot find a meal with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        await this.mealRepository.updateOne({ _id: meal._id }, {
            $unset: {
                softAdded: true
            }
        });
        const addedMeal = await this.mealRepository.findById(meal._id) as MealDocument;
        await this.redisService.set<MealDocument>(addedMeal, 'meal');
        this.loggerService.info(context, `Cached a meal with "${meal._id}" id.`);

        this.loggerService.info(context, `Meal with id "${meal._id}" (titled: "${meal.title}") has been confirmed adding by "${user.login}" user.`);

        return addedMeal;
    }

    async edit(id: string, mealEditDto: MealEditDto): Promise<MealDocument> {
        const context = 'MealService/edit';

        if (!isValidObjectId(id)) {
            const message = `Provided "${id}" that is not a correct MongoDB id.`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const meal = await this.mealRepository.findById(id) as MealDocument;

        if (!meal) {
            const message = `Cannot find a meal with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        await this.mealRepository.updateOne({ _id: meal._id }, {
            $set: {
                softEdited: mealEditDto
            }
        });
        const editedMeal = await this.mealRepository.findById(meal._id) as MealDocument;
        this.loggerService.info(context, `Meal with id "${meal._id}" (titled: "${meal.title}") has been edited.`);

        return editedMeal;
    }

    async confirmEditing(id: string, user: UserDto): Promise<MealDocument> {
        const context = 'MealService/confirmEditing';

        if (!isValidObjectId(id)) {
            const message = `Provided "${id}" that is not a correct MongoDB id.`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const meal = await this.mealRepository.findById(id) as MealDocument;

        if (!meal) {
            const message = `Cannot find a meal with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        await this.mealRepository.updateOne({ _id: id }, {
            $unset: { softEdited: {}},
            $set: { ...meal.softEdited }
        });
        const updatedMeal = await this.mealRepository.findById(id) as MealDocument;
        await this.redisService.set<MealDocument>(updatedMeal, 'meal');
        this.loggerService.info(context, `Cached a meal with "${meal._id}" id.`);

        this.loggerService.info(context, `Meal with id "${meal._id}" (titled: "${meal.title}") has been confirmed editing by "${user.login}" user.`);

        return updatedMeal as MealDocument;
    }

    async delete(id: string): Promise<MealDocument> {
        const context = 'MealService/delete';

        if (!isValidObjectId(id)) {
            const message = `Provided "${id}" that is not a correct MongoDB id.`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const meal = await this.mealRepository.findById(id) as MealDocument;

        if (!meal) {
            const message = `Cannot find a meal with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        await this.redisService.unset<MealDocument>(meal, 'meal');
        await this.mealRepository.updateOne({ _id: meal._id }, {
            $set: {
                softDeleted: true
            }
        });
        const deletedMeal = await this.mealRepository.findById(meal._id) as MealDocument;
        this.loggerService.info(context, `Meal with id "${meal._id}" (titled: "${meal.title}") has been marked as soft deleted.`);

        return deletedMeal;
    }

    async confirmDeleting(id: string, user: UserDto): Promise<MealDocument | null> {
        const context = 'MealService/confirmDeleting';

        if (!isValidObjectId(id)) {
            const message = `Provided "${id}" that is not a correct MongoDB id.`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const meal = await this.mealRepository.findById(id) as MealDocument;

        if (!meal) {
            const message = `Cannot find a meal with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        await this.mealRepository.deleteOne({ _id: meal._id });
        const deletedMeal = await this.mealRepository.findById(meal._id) as MealDocument;

        this.loggerService.info(context, `Meal with id "${meal._id}" (titled: "${meal.title}") has been confirmed deleting by "${user.login}" user.`);

        return deletedMeal;
    }

    async getMealDetails(id: string): Promise<DetailedMeal> {
        const context = 'MealService/getMealDetails';

        if (!id) {
            throw new BadRequestException(context, 'Not provided id param.');
        }

        const cachedMeal: DetailedMeal = await this.redisService.getMealDetails(id);

        if (cachedMeal) {
            this.loggerService.info(context, `Found in cache a meal with id "${id}".`);

            return cachedMeal;
        }

        if (isValidObjectId(id)) {
            const mealDocument: MealDocument = await this.mealRepository.findById(id);

            if (mealDocument) {
                const mealDetails: DetailedMeal = proceedMealDocumentToMealDetails(mealDocument);
                await this.redisService.saveMealDetails(id, mealDetails);
                this.loggerService.info(context, `Found in local database a meal with id "${id}" and cached.`);

                return mealDetails;
            }
        }

        const datasets: Array<DetailedMeal | null> = await Promise.all([
            this.spoonacularApiService.getMealDetails(`recipes/${id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`, `recipes/${id}/analyzedInstructions?apiKey=${process.env.SPOONACULAR_API_KEY}`)
        ]);

        const filteredMeal: DetailedMeal = datasets.find(meal => meal !== null);

        if (filteredMeal) {
            await this.redisService.saveMealDetails(id, filteredMeal);
            this.loggerService.info(context, `Found in external database a meal with id "${id}" and cached.`);

            return filteredMeal;
        }

        throw new NotFoundException(context, `Meal with "${id}" does not exist in any integrated API.`);
    }

    async find(id: string): Promise<MealDocument> {
        const context = 'MealService/find';

        if (!isValidObjectId(id)) {
            const message = `Provided "${id}" that is not a correct MongoDB id.`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const key = this.redisService.encodeKey({ _id: id }, 'meal');
        const cachedMeal = await this.redisService.get<MealDocument>(key) as MealDocument;

        if (cachedMeal) {
            if (cachedMeal.softDeleted) {
                const message = `Cannot find a meal with "${id}" id.`;
                this.loggerService.error(context, message);

                throw new NotFoundException(context, message);
            }

            this.loggerService.info(context, `Fetched a meal with "${cachedMeal._id}" id from cache.`);

            return cachedMeal;
        }

        const meal = await this.mealRepository.findOne({
            _id: id,
            softAdded: { $exists: false },
            softDeleted: { $exists: false }
        }) as MealDocument;

        if (!meal) {
            const message = `Cannot find a meal with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        this.loggerService.info(context, `Found meal with "${id}" (titled: "${meal.title}") id.`);
        await this.redisService.set(meal, 'meal');
        this.loggerService.info(context, `Cached a meal with "${id}" (titled: "${meal.title}") id.`);

        return meal;
    }

    async findAll(): Promise<MealDocument[]> {
        const meals = (await this.mealRepository.findAll({ softDeleted: { $exists: false }})) as MealDocument[];
        const message = `Found ${meals.length} meals.`;

        this.loggerService.info('MealService/findAll', message);

        return meals;
    }

    async getMeals(ings: IngredientType[], type: MealType): Promise<RatedMeal[]> {
        const filteredIngredients = this.ingredientService.filterIngredients(ings);
        const query = getQueryWithIngredientsAndMealType(filteredIngredients, type);
        const cachedResult = await this.redisService.getMealResult('merged', query);
        const context = 'MealService/getMeals';

        if (cachedResult) {
            this.loggerService.info(context, `Found cached result "${query}" containing ${cachedResult.length} meals.`);

            return cachedResult;
        }

        const datasets: Array<RatedMeal[] | null> = await Promise.all([
            this.spoonacularApiService.getMeals(process.env.SPOONACULAR_API_KEY, 'recipes/findByIngredients', filteredIngredients, type)
        ]);

        const meals = datasets
            .filter((set: RatedMeal[]): boolean => Boolean(set.length))
            .flat()
            .sort((meal1: RatedMeal, meal2: RatedMeal): number => meal2.relevance - meal1.relevance);
        await this.redisService.saveMealResult('merged', query, meals, 12 * HOUR);
        this.loggerService.info(context, `Cached result containing ${meals.length} meals, defined for query "${query}".`);

        return meals;
    }

    async getMealProposal(user: UserAccessTokenPayload) {
        const dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - 14);

        const searchQueries: SearchQueryDocument[] = await this.searchQueryRepository.findAll({ date: { $gte: dateFilter }, login: user.login });
        const mergedSearchQueries: MergedSearchQueries = mergeSearchQueries(searchQueries);
        const datasets: Array<RatedMeal[] | null> = await Promise.all([
            this.spoonacularApiService.getMeals(process.env.SPOONACULAR_API_KEY, 'recipes/findByIngredients', Object.keys(mergedSearchQueries))
        ]);
        const meals: RatedMeal[] = datasets.flat();
        const proposedMeals: ProposedMeal[] = proceedRatedMealsToProposedMeals(meals, mergedSearchQueries);

        this.loggerService.info('MealService/getMealProposal', `Generated ${proposedMeals.length} meal proposal${proposedMeals.length > 1 ? 's' : ''}.`);

        return proposedMeals
            .filter(meal => meal.recommendationPoints > 0)
            .sort((a, b) => b.recommendationPoints - a.recommendationPoints);
    }

    async addMealProposal(user: UserAccessTokenPayload, ingredients: string[]) {
        const filteredIngredients = this.ingredientService.filterIngredients(ingredients);
        await this.searchQueryRepository.create({ ingredients: filteredIngredients, date: new Date(), login: user.login });
        this.loggerService.info('MealService/addMealProposal', `Added search query for user ${user.login}.`);
    }

    async getMealsSoftAdded(): Promise<MealDocument[]> {
        return await this.mealRepository.findAll({ softAdded: { $eq: true }});
    }

    async getMealsSoftEdited(): Promise<MealDocument[]> {
        return await this.mealRepository.findAll({ softEdited: { $eq: true }});
    }

    async getMealsSoftDeleted(): Promise<MealDocument[]> {
        return await this.mealRepository.findAll({ softDeleted: { $eq: true }});
    }

    async hasMeal(mealId: string): Promise<boolean> {
        const context: ContextString = 'MealService/hasMeal';
        const isSaved = await this.redisService.hasMeal(mealId);

        if (isSaved) {
            return true;
        }

        // NOTE: When it is usual request after fetching details, it should be found within cache
        // Checking existence of the meal
        if (isValidObjectId(mealId)) {
            const meal = await this.mealRepository.findById(mealId);

            if (meal) {
                return true;
            }
        } else {
            const datasets: Array<DetailedMeal | null> = await Promise.all([
                this.spoonacularApiService.getMealDetails(`recipes/${mealId}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`, `recipes/${mealId}/analyzedInstructions?apiKey=${process.env.SPOONACULAR_API_KEY}`)
            ]);

            const filteredMeal: DetailedMeal = datasets.find(meal => meal !== null);

            if (filteredMeal) {
                await this.redisService.saveMealDetails(mealId, filteredMeal);
                this.loggerService.info(context, `Cached a meal with id "${mealId}".`);

                return true;
            }
        }

        return false;
    }

    async getComments(mealId: string): Promise<MealCommentDocument[]> {
        const context: ContextString = 'MealService/getComments';
        const hasMeal = await this.hasMeal(mealId);

        if (!hasMeal) {
            const message = 'Meal with provided ID does not exist.';
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        const comments = await this.mealCommentRepository.findAll({ mealId });

        this.loggerService.info(context, `Found ${comments.length} comments for "${mealId}" meal.`);

        return comments;
    }

    async addComment(createCommentBody: CreateMealCommentBody): Promise<void> {
        const context: ContextString = 'MealService/addComment';
        const hasMeal = await this.hasMeal(createCommentBody.mealId);

        if (!hasMeal) {
            const message = 'Meal with provided ID does not exist.';
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        await this.mealCommentRepository.create({ ...createCommentBody, posted: Date.now() });
        this.loggerService.info(context, `Successfully added a new comment to ${createCommentBody.mealId} meal by "${createCommentBody.user}" user.`);
    }

    async calculateRating(mealId: string): Promise<MealRating> {
        const context: ContextString = 'MealService/calculateRating';
        const hasMeal = await this.hasMeal(mealId);

        if (!hasMeal) {
            const message = 'Meal with provided ID does not exist.';
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        this.loggerService.info(context, `Calculated rating for meal "${mealId}".`);

        return await this.mealRatingRepository.getAverageRatingForMeal(mealId);
    }
}
