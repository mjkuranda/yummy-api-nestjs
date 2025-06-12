import { AbstractRepository } from './abstract.repository';
import { InjectModel } from '@nestjs/mongoose';
import { dishRatingModel } from '../../common/definitions/mongoose-model.definitions';
import { Model, PipelineStage } from 'mongoose';
import { DishRatingDocument } from '../documents/dish-rating.document';
import { CreateDishRatingBody, CreateDishRatingDto } from '../../modules/dish/dish.dto';
import { DishId, DishRating } from '../../modules/dish/dish.types';
import { DishRatingEntity } from '../../modules/dish/domain/common/entities';

export class DishRatingRepository extends AbstractRepository<DishRatingDocument, CreateDishRatingDto> {

    constructor(@InjectModel(dishRatingModel.name) model: Model<DishRatingDocument>) {
        super(model);
    }

    async updateAndReturn(createRatingBody: CreateDishRatingBody, userLogin: string): Promise<DishRatingDocument> {
        return await this.updateAndReturnDocument(
            {
                dishId: createRatingBody.encodedDishId,
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

    async getAverageRatingForDish(dishId: DishId): Promise<DishRatingEntity> {
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
            return new DishRatingEntity(
                dishId,
                result[0].rating,
                result[0].count
            );
        }

        return new DishRatingEntity(
            dishId,
            0,
            0
        );
    }
}