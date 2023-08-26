import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { MealDocument } from './meal.interface';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { QueryResult } from '../../common/interfaces';

@Injectable()
export class MealService {
    constructor(
    @InjectModel(models.MEAL_MODEL)
    private mealModel: Model<MealDocument>,
    ) {}

    async create(createMealDto: MealDocument): Promise<QueryResult<MealDocument>> {
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
        if (!Types.ObjectId.isValid(id)) {
            const message = `Provided "${id}" that is not a correct MongoDB id.`;
            console.error('MealService/find:', message);

            return {
                message,
                statusCode: 400
            };
        }

        const meal = await this.mealModel.findById(id);

        if (meal === null) {
            const message = `Cannot find a meal with "${id}" id.`;
            console.error('MealService/find:', message);

            return {
                message,
                statusCode: 404
            };
        }

        const message = `Found meal with "${id}" id.`;
        console.info('MealService/find:', message);

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
