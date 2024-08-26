import { AbstractRepository } from './abstract.repository';
import { MealCommentDocument } from '../documents/meal-comment.document';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { CreateMealCommentDto } from '../../modules/meal/meal.dto';

export class MealCommentRepository extends AbstractRepository<MealCommentDocument, CreateMealCommentDto> {

    constructor(@InjectModel(models.MEAL_COMMENT_MODEL) model: Model<MealCommentDocument>) {
        super(model);
    }
}