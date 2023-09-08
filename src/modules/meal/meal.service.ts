import { Model, isValidObjectId } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { MealDocument } from './meal.interface';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { QueryResult } from '../../common/interfaces';
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

    async create(createMealDto: CreateMealDto): Promise<QueryResult<MealDocument>> {
        const createdMeal = await this.mealModel.create(createMealDto) as MealDocument;

        const title = createMealDto.title;
        const ingredientCount = createMealDto.ingredients.length;
        const imageUrlDescription = createMealDto
            ? `"${createMealDto.imageUrl}" image url`
            : 'no image';
        const message = `New meal "${title}", having ${ingredientCount} ingredients and with ${imageUrlDescription}.`;

        this.loggerService.info('MealService/create:', message);

        return {
            data: createdMeal,
            message,
            statusCode: 201
        };
    }

    async find(id: string): Promise<QueryResult<MealDocument>> {
        const context = 'MealService/find';

        if (!isValidObjectId(id)) {
            const message = `Provided "${id}" that is not a correct MongoDB id.`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const meal = await this.mealModel.findById(id);

        if (!meal) {
            const message = `Cannot find a meal with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        const message = `Found meal with "${id}" id.`;
        this.loggerService.info(context, message);

        return {
            data: meal as MealDocument,
            message,
            statusCode: 200
        };
    }

    async findAll(): Promise<QueryResult<MealDocument>> {
        const meals = (await this.mealModel.find()) as MealDocument[];
        const message = `Found ${meals.length} meals.`;

        this.loggerService.info('MealService/findAll', message);

        return {
            data: meals,
            message,
            statusCode: 200
        };
    }
}
