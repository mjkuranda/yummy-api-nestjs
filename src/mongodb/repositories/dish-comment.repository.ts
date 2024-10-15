import { AbstractRepository } from './abstract.repository';
import { DishCommentDocument } from '../documents/dish-comment.document';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { CreateDishCommentDto } from '../../modules/dish/dish.dto';

export class DishCommentRepository extends AbstractRepository<DishCommentDocument, CreateDishCommentDto> {

    constructor(@InjectModel(models.DISH_COMMENT_MODEL) model: Model<DishCommentDocument>) {
        super(model);
    }

    async deleteAll(dishId: string): Promise<void> {
        await this.model.deleteMany({ dishId });
    }
}