import { Model, isValidObjectId } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { MealDocument } from './meal.interface';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { CreateMealDto } from './meal.dto';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class MealService {

    constructor(
        @InjectModel(models.MEAL_MODEL)
        private mealModel: Model<MealDocument>,
        private loggerService: LoggerService
    ) {}

    async create(createMealDto: CreateMealDto): Promise<MealDocument> {
        const createdMeal = await this.mealModel.create(createMealDto) as MealDocument;

        const title = createMealDto.title;
        const ingredientCount = createMealDto.ingredients.length;
        const imageUrlDescription = createMealDto
            ? `"${createMealDto.imageUrl}" image url`
            : 'no image';
        const message = `New meal "${title}", having ${ingredientCount} ingredients and with ${imageUrlDescription}.`;

        this.loggerService.info('MealService/create:', message);

        return createdMeal;
    }

    async find(id: string): Promise<MealDocument> {
        const context = 'MealService/find';

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

        const message = `Found meal with "${id}" id.`;
        this.loggerService.info(context, message);

        return meal;
    }

    async findAll(): Promise<MealDocument[]> {
        const meals = (await this.mealModel.find()) as MealDocument[];
        const message = `Found ${meals.length} meals.`;

        this.loggerService.info('MealService/findAll', message);

        return meals;
    }
}
