import { AbstractRepository } from './abstract.repository';
import { DishCommentDocument } from '../documents/dish-comment.document';
import { InjectModel } from '@nestjs/mongoose';
import { dishCommentModel } from '../../common/definitions/mongoose-model.definitions';
import { Model } from 'mongoose';
import { CreateDishCommentDto } from '../../modules/dish/dish.dto';

export class DishCommentRepository extends AbstractRepository<DishCommentDocument, CreateDishCommentDto> {

    constructor(@InjectModel(dishCommentModel.name) model: Model<DishCommentDocument>) {
        super(model);
    }

    async deleteAll(dishId: string): Promise<void> {
        await this.model.deleteMany({ dishId });
    }
}