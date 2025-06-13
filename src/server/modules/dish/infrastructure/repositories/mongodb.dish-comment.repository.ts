import { DishCommentDocument } from '../../../../../infrastructure/databases/mongodb/documents/dish-comment.document';
import { InjectModel } from '@nestjs/mongoose';
import { dishCommentModel } from '../../../../common/definitions/mongoose-model.definitions';
import { Model } from 'mongoose';
import { DishId } from '../../dish.types';
import { DishCommentEntity } from '../../domain/common/entities';
import { DishCommentFactory } from '../../domain/common/factories';
import { DishCommentRepository } from '../../domain/common/repositories';

export class MongodbDishCommentRepository implements DishCommentRepository {

    constructor(
        @InjectModel(dishCommentModel.name) private readonly model: Model<DishCommentDocument>
    ) {}

    async post(userLogin: string, text: string, dishId: DishId): Promise<void> {
        await this.model.create({
            dishId,
            text,
            user: userLogin,
            posted: Date.now()
        });
    }

    async getAll(dishId: DishId, limit?: number): Promise<DishCommentEntity[]> {
        const docs = await this.model.find({ dishId }).limit(limit ?? 1000);

        return DishCommentFactory.fromDocuments(docs);
    }

    async deleteAll(dishId: string): Promise<void> {
        await this.model.deleteMany({ dishId });
    }
}