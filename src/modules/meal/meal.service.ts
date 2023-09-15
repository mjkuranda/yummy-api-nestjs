import { Model, isValidObjectId } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { MealDocument } from './meal.interface';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { CreateMealDto, MealEditDto } from './meal.dto';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { LoggerService } from '../logger/logger.service';
import { RedisService } from '../redis/redis.service';
import { UserDto } from '../user/user.dto';

@Injectable()
export class MealService {

    constructor(
        @InjectModel(models.MEAL_MODEL)
        private mealModel: Model<MealDocument>,
        private redisService: RedisService,
        private loggerService: LoggerService
    ) {}

    async create(createMealDto: CreateMealDto): Promise<MealDocument> {
        const createdMeal = await this.mealModel.create({ ...createMealDto, softAdded: true }) as MealDocument;

        const title = createMealDto.title;
        const ingredientCount = createMealDto.ingredients.length;
        const imageUrlDescription = createMealDto
            ? `"${createMealDto.imageUrl}" image url`
            : 'no image';
        const context = 'MealService/create';
        const message = `New meal "${title}", having ${ingredientCount} ingredients and with ${imageUrlDescription}.`;

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

        const meal = await this.mealModel.findById(id) as MealDocument;

        if (!meal) {
            const message = `Cannot find a meal with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        await this.mealModel.updateOne({ _id: meal._id }, {
            $unset: {
                softAdded: true
            }
        });
        const addedMeal = await this.mealModel.findById(meal._id) as MealDocument;
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

        const meal = await this.mealModel.findById(id) as MealDocument;

        if (!meal) {
            const message = `Cannot find a meal with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        await this.mealModel.updateOne({ _id: meal._id }, {
            $set: {
                softEdited: mealEditDto
            }
        });
        const editedMeal = await this.mealModel.findById(meal._id) as MealDocument;
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

        const meal = await this.mealModel.findById(id) as MealDocument;

        if (!meal) {
            const message = `Cannot find a meal with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        const updatedMeal = {
            ...meal,
            ...meal.softEdited
        };
        delete updatedMeal.softEdited;

        await this.mealModel.replaceOne({ _id: meal._id }, updatedMeal);
        await this.redisService.set<MealDocument>(updatedMeal as MealDocument, 'meal');
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

        const meal = await this.mealModel.findById(id) as MealDocument;

        if (!meal) {
            const message = `Cannot find a meal with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        await this.redisService.unset<MealDocument>(meal, 'meal');
        await this.mealModel.updateOne({ _id: meal._id }, {
            $set: {
                softDeleted: true
            }
        });
        const deletedMeal = await this.mealModel.findById(meal._id) as MealDocument;
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

        const meal = await this.mealModel.findById(id) as MealDocument;

        if (!meal) {
            const message = `Cannot find a meal with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        await this.mealModel.deleteOne({ _id: meal._id });
        const deletedMeal = await this.mealModel.findById(meal._id) as MealDocument;

        this.loggerService.info(context, `Meal with id "${meal._id}" (titled: "${meal.title}") has been confirmed deleting by "${user.login}" user.`);

        return deletedMeal;
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

        const meal = await this.mealModel.findById(id) as MealDocument;

        if (!meal) {
            const message = `Cannot find a meal with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        this.loggerService.info(context, `Found meal with "${id}" id.`);
        await this.redisService.set(meal, 'meal');

        return meal;
    }

    async findAll(): Promise<MealDocument[]> {
        const meals = (await this.mealModel.find({ softDeleted: { $exists: false }})) as MealDocument[];
        const message = `Found ${meals.length} meals.`;

        this.loggerService.info('MealService/findAll', message);

        return meals;
    }
}
