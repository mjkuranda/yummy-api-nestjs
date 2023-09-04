import { Model, Types } from 'mongoose';
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

    constructor(@InjectModel(models.MEAL_MODEL)
                private mealModel: Model<MealDocument>,
                private loggerService: LoggerService) {}

    async create(createMealDto: CreateMealDto): Promise<QueryResult<MealDocument>> {
        const createdMeal = new this.mealModel(createMealDto);

        const title = createMealDto.title;
        const ingredientCount = createMealDto.ingredients.length;
        const imageUrlDescription = createMealDto
            ? `"${createMealDto.imageUrl}" image url`
            : 'no image';
        const message = `New meal "${title}", having ${ingredientCount} ingredients and with ${imageUrlDescription}.`;
        const data = await createdMeal.save() as MealDocument;

        console.info('MealService/create:', message);

        return {
            data,
            message,
            statusCode: 201
        };
    }

    async find(id: string): Promise<QueryResult<MealDocument>> {
        const  context = 'MealService/find:';

        if (!Types.ObjectId.isValid(id)) {
            const message = `Provided "${id}" that is not a correct MongoDB id.`;
            console.error(context, message);
            this.loggerService.log('error', message);

            throw new BadRequestException(context, message);
        }

        const meal = await this.mealModel.findById(id);

        if (!meal) {
            const message = `Cannot find a meal with "${id}" id.`;
            console.error(context, message);

            throw new NotFoundException(context, message);
        }

        const message = `Found meal with "${id}" id.`;
        console.info(context, message);

        return {
            data: meal as MealDocument,
            message,
            statusCode: 200
        };
    }

    async findAll(): Promise<QueryResult<MealDocument>> {
        const meals = (await this.mealModel.find()) as MealDocument[];
        const message = `Found ${meals.length} meals.`;

        console.info('MealService/findAll:', message);

        return {
            data: meals,
            message,
            statusCode: 200
        };
    }
}
