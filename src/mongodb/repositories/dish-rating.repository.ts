import { AbstractRepository } from './abstract.repository';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model, PipelineStage } from 'mongoose';
import { DishRatingDocument } from '../documents/dish-rating.document';
import { CreateDishRatingDto } from '../../modules/dish/dish.dto';
import { DishRating } from '../../modules/dish/dish.types';

export class DishRatingRepository extends AbstractRepository<DishRatingDocument, CreateDishRatingDto> {

    constructor(@InjectModel(models.DISH_RATING_MODEL) model: Model<DishRatingDocument>) {
        super(model);
    }

    async deleteAll(dishId: string): Promise<void> {
        await this.model.deleteMany({ dishId });
    }

    async getAverageRatingForDish(dishId: string): Promise<DishRating> {
        const pipeline: PipelineStage[] = [
            { $match: { dishId }},
            {
                $group: {
                    _id: '$dishId',
                    rating: { $avg: '$rating' },
                    count: { $sum: 1 },
                },
            },
        ];

        const result = await this.calculateAverage(pipeline);

        if (result.length > 0) {
            return {
                dishId,
                rating: result[0].rating,
                count: result[0].count,
            };
        }

        return {
            dishId,
            rating: 0,
            count: 0
        };
    }
}