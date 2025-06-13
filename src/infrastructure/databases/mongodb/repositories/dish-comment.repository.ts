import { AbstractRepository } from './abstract.repository';
import { DishCommentDocument } from '../documents/dish-comment.document';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDishCommentDto } from '../../../../server/modules/dish/dish.dto';
import { dishCommentModel } from '../../../../server/common/definitions/mongoose-model.definitions';
import { DishId } from '../../../../server/modules/dish/dish.types';
import { DishCommentEntity } from '../../../../server/modules/dish/domain/common/entities';
import { DishCommentFactory } from '../../../../server/modules/dish/domain/common/factories';

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