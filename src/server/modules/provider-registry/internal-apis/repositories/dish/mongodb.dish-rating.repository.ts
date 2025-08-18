import { DishRatingDocument } from '../../../../../../infrastructure/databases/mongodb/documents';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { DishRatingRepository } from '../../../../dish/domain/common/repositories';
import { dishRatingModel } from '../../../../../common/definitions/mongoose-model.definitions';
import { DishId } from '../../../../../common/types';
import { DishRatingEntity } from '../../../../dish/domain/common/entities';

export class MongodbDishRatingRepository implements DishRatingRepository {

    constructor(
        @InjectModel(dishRatingModel.name) private readonly model: Model<DishRatingDocument>
    ) {}

    async findRating(userLogin: string, dishId: DishId): Promise<DishRatingEntity | null> {
        const doc = await this.model.findOne({
            dishId,
            user: userLogin
        });

        if (!doc) {
            return null;
        }

        const ratingDoc = doc as DishRatingDocument;

        return new DishRatingEntity(
            dishId,
            ratingDoc.rating,
            1
        );
    }

    async insertNewRating(userLogin: string, dishId: DishId, rating: number): Promise<void> {
        await this.model.create({
            dishId,
            user: userLogin,
            rating,
            posted: Date.now()
        });
    }

    async updateRating(userLogin: string, dishId: DishId, newRating: number): Promise<void> {
        await this.model.findOneAndUpdate(
            {
                dishId,
                user: userLogin
            },
            {
                rating: newRating,
                posted: Date.now()
            }
        );
    }

    async deleteAllRatings(dishId: DishId): Promise<void> {
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

        const result = await this.model.aggregate(pipeline);

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