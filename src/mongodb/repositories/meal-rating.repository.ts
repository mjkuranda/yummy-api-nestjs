import { AbstractRepository } from './abstract.repository';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model, PipelineStage } from 'mongoose';
import { MealRatingDocument } from '../documents/meal-rating.document';
import { CreateMealRatingDto } from '../../modules/meal/meal.dto';
import { MealRating } from '../../modules/meal/meal.types';

export class MealRatingRepository extends AbstractRepository<MealRatingDocument, CreateMealRatingDto> {

    constructor(@InjectModel(models.MEAL_RATING_MODEL) model: Model<MealRatingDocument>) {
        super(model);
    }

    async getAverageRatingForMeal(mealId: string): Promise<MealRating> {
        const pipeline: PipelineStage[] = [
            { $match: { mealId }},
            {
                $group: {
                    _id: '$mealId',
                    rating: { $avg: '$rating' },
                    count: { $sum: 1 },
                },
            },
        ];

        const result = await this.calculateAverage(pipeline);

        if (result.length > 0) {
            return {
                mealId,
                rating: result[0].rating,
                count: result[0].count,
            };
        }

        return {
            mealId,
            rating: 0,
            count: 0
        };
    }
}