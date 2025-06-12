import { AbstractRepository } from './abstract.repository';
import { DishCommentDocument } from '../documents/dish-comment.document';
import { InjectModel } from '@nestjs/mongoose';
import { dishCommentModel } from '../../common/definitions/mongoose-model.definitions';
import { Model } from 'mongoose';
import { CreateDishCommentDto } from '../../modules/dish/dish.dto';
import { DishCommentEntity } from '../../modules/dish/domain/common/entities';
import { DishCommentFactory } from '../../modules/dish/domain/common/factories';
import { DishId } from '../../modules/dish/dish.types';

export class DishCommentRepository extends AbstractRepository<DishCommentDocument, CreateDishCommentDto> {

    constructor(@InjectModel(dishCommentModel.name) model: Model<DishCommentDocument>) {
        super(model);
    }

    async getAll(dishId: DishId, limit?: number): Promise<DishCommentEntity[]> {
        const docs = await super.findAll({ dishId }, limit);

        return DishCommentFactory.fromDocuments(docs);
    }

    async deleteAll(dishId: string): Promise<void> {
        await this.model.deleteMany({ dishId });
    }
}