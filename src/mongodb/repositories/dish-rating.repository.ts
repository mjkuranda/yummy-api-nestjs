import { AbstractRepository } from './abstract.repository';
import { InjectModel } from '@nestjs/mongoose';
import { dishRatingModel } from '../../common/definitions/mongoose-model.definitions';
import { Model, PipelineStage } from 'mongoose';
import { DishRatingDocument } from '../documents/dish-rating.document';
import { CreateDishRatingBody, CreateDishRatingDto } from '../../modules/dish/dish.dto';
import { DishRating } from '../../modules/dish/dish.types';

export class DishRatingRepository extends AbstractRepository<DishRatingDocument, CreateDishRatingDto> {

    constructor(@InjectModel(dishRatingModel.name) model: Model<DishRatingDocument>) {
        super(model);
    }

    async updateAndReturn(createRatingBody: CreateDishRatingBody, userLogin: string): Promise<DishRatingDocument> {
        return await this.updateAndReturnDocument(
            {
                dishId: createRatingBody.dishId,
                user: userLogin
            },
            {
                ...createRatingBody,
                posted: Date.now()
            }
        );
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