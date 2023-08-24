import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { MealDocument } from './meal.interface';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { EmptyDocument } from '../../common/types';

@Injectable()
export class MealService {
    constructor(
    @InjectModel(models.MEAL_MODEL)
    private mealModel: Model<MealDocument>,
    ) {}

    async create(createMealDto: MealDocument): Promise<MealDocument> {
        console.log(createMealDto);

        const createdMeal = new this.mealModel(createMealDto);

        const title = createMealDto.title;
        const ingredientCount = createMealDto.ingredients.length;
        const imageUrlDescription = createMealDto
            ? `"${createMealDto.imageUrl}" image url`
            : 'no image';

        console.log(
            `MealService/create: New meal "${title}", having ${ingredientCount} ingredients and with ${imageUrlDescription}.`,
        );

        return createdMeal.save();
    }

    async find(id: string): Promise<MealDocument | EmptyDocument> {
        if (!Types.ObjectId.isValid(id)) {
            console.error(
                `MealService/find: Provided "${id}" that is not a correct MongoDB id.`,
            );

            return {};
        }

        const meal = await this.mealModel.findById(id);

        if (meal === null) {
            console.error(`MealService/find: Cannot find a meal with "${id}" id.`);

            return {};
        }

        console.info(`MealService/find: Found meal with "${id}" id.`);

        return meal;
    }

    async findAll(): Promise<MealDocument[]> {
        const meals = (await this.mealModel.find()) as MealDocument[];

        console.info(`MealService/findAll: Found ${meals.length} meals.`);

        return meals;
    }
}
